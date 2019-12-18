
// pardon my C#-ish code stle :)

import { ConfigurationTarget, workspace, window, StatusBarItem, ExtensionContext, StatusBarAlignment, commands } from 'vscode'

let _statusBarItem: StatusBarItem;
let _context: ExtensionContext;

const extensionName = "themeInfo";
const titleSetting = `${extensionName}.windowTitle`;
const templateSetting = `${extensionName}.template`;

export function activate(context: ExtensionContext)
{
	_statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);

	_context = context;
	_context.subscriptions.push(_statusBarItem);

	_context.subscriptions.push(workspace.onDidChangeConfiguration(updateStatusBarItem));
	_context.subscriptions.push(workspace.onDidChangeConfiguration(updateWindowTitle));

	_context.subscriptions.push(commands.registerCommand(`${extensionName}.addInfoGlobal`, addInfoGlobal));
	_context.subscriptions.push(commands.registerCommand(`${extensionName}.addInfoWorkspace`, addInfoWorkspace));
	_context.subscriptions.push(commands.registerCommand(`${extensionName}.showInfo`, showInfo));

	updateStatusBarItem();
	updateWindowTitle();
}

function addInfoGlobal(): void
{
	addInfo(ConfigurationTarget.Global);
}

function addInfoWorkspace(): void
{
	addInfo(ConfigurationTarget.Workspace);
}

function addInfo(scope: ConfigurationTarget): void
{
	const newTitle = getConfig("window.title") + "${separator}" + getConfig(templateSetting);
	const config = workspace.getConfiguration();
	config.update(titleSetting, newTitle, scope);

	window.showInformationMessage("Edit themeInfo.windowTitle to change appearance if you want.");
}

function showInfo(): void
{
	const template = getConfig(templateSetting);
	const message = applyVariables(template);
	window.showInformationMessage(message);
}

function updateStatusBarItem(): void
{
	const template = getConfig(templateSetting);

	if (template == "")
	{
		_statusBarItem.text = "";
		_statusBarItem.hide();
	}
	else
	{
		_statusBarItem.text = applyVariables(template);
		_statusBarItem.show();
	}
}

function updateWindowTitle(): void
{
	const template = getConfig(titleSetting);

	if (template == "")
	{
		return;
	}

	const scope = getScope(titleSetting);
	const config = workspace.getConfiguration();
	config.update("window.title", applyVariables(template), scope);
}

function applyVariables(template: string): string
{
	const font = getConfig("editor.fontFamily");
	const theme = getConfig("workbench.colorTheme");

	template = template.replace("${font}", font);
	template = template.replace("${theme}", theme);

	return template;
}

function getConfig(section: string): string
{
	// ?? causing issues loading extension, figure it out
	return workspace.getConfiguration().get(section) || "";
}

function getScope(section: string): ConfigurationTarget
{
	const config = workspace.getConfiguration();
	const info = config.inspect(section);

	// ?. causing issues loading extension, figure it out
	if (info == undefined) return ConfigurationTarget.Global;

	if (info.workspaceFolderValue != null) return ConfigurationTarget.WorkspaceFolder;
	else if (info.workspaceValue != null) return ConfigurationTarget.Workspace;
	else return ConfigurationTarget.Global;
}

export function deactivate()
{
	_context.subscriptions.forEach(subscription => subscription.dispose())
	_statusBarItem.dispose();
}

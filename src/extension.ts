
import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

export function activate({ subscriptions }: vscode.ExtensionContext)
{
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	subscriptions.push(statusBarItem);
	subscriptions.push(vscode.workspace.onDidChangeConfiguration(updateStatusBarItem));
	updateStatusBarItem();
	statusBarItem.show();
}

function updateStatusBarItem(): void
{
	let font = vscode.workspace.getConfiguration("editor", null).get("fontFamily");
	let theme = vscode.workspace.getConfiguration("workbench", null).get("colorTheme");
	statusBarItem.text = `font: ${font} | theme: ${theme}`;
}

// export function deactivate() {}

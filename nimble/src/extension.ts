// import * as vscode from 'vscode';
import { ExtensionContext, commands, window, ViewColumn, Uri, workspace } from 'vscode';
import * as path from 'path';

function loadScript(context: ExtensionContext, path: string) {
    return `<script src="${Uri.file(context.asAbsolutePath(path)).with({ scheme: 'vscode-resource'}).toString()}"></script>`;
}

export function activate(context: ExtensionContext) {
	console.log('Congratulations, your extension "nimble" is now active!');
	let startCommand = commands.registerCommand('extension.startNimble', () => {
		
		const panel = window.createWebviewPanel('nimble', 'Nimble', ViewColumn.Beside, {enableScripts: true,});
		panel.webview.html = getWebviewContent(context);
		
		panel.webview.onDidReceiveMessage(message => {
				switch(message.command) {
					case 'stats':
						console.log('analyzing bundle at:', __dirname);
						/*this is how you would access the current user's uri/workspace.  
							note: the developer's workspace would have to be open in the same vscode window (next to our ext), otherwise it'd be undefined - refer to vscode api>workspace
							it returns an array with it's first element being an object: {
								uri: {
									fsPath:  
									external: this includes the scheme;
									path: we would use this**
									scheme:
								},
								name:,
								index:
							}
						*/
						console.log(workspace.workspaceFolders);

				}
		});
	
	
	});
	context.subscriptions.push(startCommand);
}

function getWebviewContent(context: ExtensionContext) {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="Content-Security-Policy">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Nimble</title>
	</head>

	<body>
	<div id="root"></div>
		<script>
		const vscode = acquireVsCodeApi();
		</script>
		${loadScript(context, 'out/nimble.js')}
	</body>
	</html>`;
}


export function deactivate() {}
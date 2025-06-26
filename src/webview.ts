import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview): string {
  // Read the built index.html
  const indexHtmlPath = path.join(context.extensionPath, 'media', 'dist', 'index.html');
  let html = fs.readFileSync(indexHtmlPath, 'utf8');

  // Replace asset paths with webview URIs
  html = html.replace(/src="\.\/assets\/(.*?)"/g, (match, p1) => {
    const assetUri = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'dist', 'assets', p1)));
    return `src="${assetUri}"`;
  });
  html = html.replace(/href="\.\/assets\/(.*?)"/g, (match, p1) => {
    const assetUri = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'dist', 'assets', p1)));
    return `href="${assetUri}"`;
  });
  html = html.replace(/href="\.\/vite\.svg"/g, () => {
    const assetUri = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'dist', 'vite.svg')));
    return `href="${assetUri}"`;
  });

  return html;
}

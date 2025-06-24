import * as dotenv from 'dotenv';
dotenv.config();

import * as vscode from 'vscode';
import * as path from 'path';
import { getWebviewContent } from './webview';
import OpenAI from 'openai';

// Load OpenAI key from .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-chat-ai.startChat', () => {
      const panel = vscode.window.createWebviewPanel(
        'chatAI',
        'AI Assistant',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      // Load HTML content into WebView
      panel.webview.html = getWebviewContent(context, panel.webview);

      // Listen for messages from React WebView
      panel.webview.onDidReceiveMessage(
        async (message) => {
          // 🧷 Handle file attachment from @mention
          if (message.type === 'mention') {
            const fileUri = await vscode.window.showOpenDialog({
              canSelectMany: false,
              openLabel: 'Attach file',
              filters: {
                'Text or Images': ['txt', 'js', 'ts', 'png', 'jpg', 'md'],
              },
            });

            if (fileUri && fileUri.length > 0) {
              const selectedFile = fileUri[0];
              const fileContent = await vscode.workspace.fs.readFile(selectedFile);
              const ext = selectedFile.path.split('.').pop()?.toLowerCase();

              if (ext && ['png', 'jpg', 'jpeg'].includes(ext)) {
                const base64 = Buffer.from(fileContent).toString('base64');
                panel.webview.postMessage({
                  type: 'ai-reply',
                  text: `🖼️ ![Image](data:image/${ext};base64,${base64})`,
                });
              } else if (ext && ['txt', 'js', 'ts', 'md'].includes(ext)) {
                const contentStr = new TextDecoder('utf-8').decode(fileContent);
                panel.webview.postMessage({
                  type: 'ai-reply',
                  text: `📎 Attached File: **${selectedFile.path.split('/').pop()}**\n\n\`\`\`\n${contentStr.slice(0, 300)}...\n\`\`\``,
                });
              } else {
                panel.webview.postMessage({
                  type: 'ai-reply',
                  text: `⚠️ Unsupported file type: **.${ext || 'unknown'}**`,
                });
              }
            }
          }

          // 🤖 Handle AI Prompt from user
          if (message.type === 'user-message') {
            console.log('📨 Received message from React:', message.text);

            try {
              const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                  { role: 'system', content: 'You are a helpful coding assistant.' },
                  { role: 'user', content: message.text },
                ],
              });

              const reply = completion.choices[0].message?.content || '🤖 AI did not respond.';

              panel.webview.postMessage({
                type: 'ai-reply',
                text: reply,
              });
            } catch (err: any) {
              console.error('❌ OpenAI API Error:', err);
              panel.webview.postMessage({
                type: 'ai-reply',
                text: '⚠️ AI Error: ' + (err.message || 'Unknown error'),
              });
            }
          }
        },
        undefined,
        context.subscriptions
      );
    })
  );
}

export function deactivate() {}
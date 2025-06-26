import * as dotenv from 'dotenv';
import * as vscode from 'vscode';
import * as path from 'path';
import { getWebviewContent } from './webview';
import OpenAI from 'openai';

// Configure dotenv to load from extension directory
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// DeepSeek-specific configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const DEEPSEEK_MODEL = 'deepseek-chat';

export function activate(context: vscode.ExtensionContext) {
    // Verify API key is present
    if (!DEEPSEEK_API_KEY) {
        vscode.window.showErrorMessage(
            'DeepSeek API key is missing. Please set DEEPSEEK_API_KEY in your .env file',
            'Open Documentation'
        ).then(selection => {
            if (selection === 'Open Documentation') {
                vscode.env.openExternal(vscode.Uri.parse('https://platform.deepseek.com/docs'));
            }
        });
        return;
    }

    // Initialize DeepSeek client
    const deepseek = new OpenAI({
        apiKey: DEEPSEEK_API_KEY,
        baseURL: DEEPSEEK_BASE_URL,
        timeout: 30000 // 30 seconds timeout
    });

    // Register chat command
    const disposable = vscode.commands.registerCommand('vscode-chat-ai.startChat', async () => {
        const panel = vscode.window.createWebviewPanel(
            'deepseekChat',
            'DeepSeek AI Assistant',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
            }
        );

        // Load webview content
        panel.webview.html = getWebviewContent(context, panel.webview);

        // Handle messages from webview
        panel.webview.onDidReceiveMessage(
            async (message) => {
                try {
                    switch (message.type) {
                        case 'mention':
                            await handleFileAttachment(panel);
                            break;
                        case 'user-message':
                            await handleDeepSeekQuery(deepseek, panel, message.text);
                            break;
                        default:
                            console.warn('Unknown message type:', message.type);
                    }
                } catch (error) {
                    console.error('Error handling message:', error);
                    panel.webview.postMessage({
                        type: 'error',
                        text: 'Error processing your request'
                    });
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

async function handleFileAttachment(panel: vscode.WebviewPanel) {
    const fileUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        openLabel: 'Attach file',
        filters: {
            'Supported Files': ['txt', 'js', 'ts', 'png', 'jpg', 'jpeg', 'md'],
        },
    });

    if (!fileUri || fileUri.length === 0) return;

    const selectedFile = fileUri[0];
    try {
        const fileContent = await vscode.workspace.fs.readFile(selectedFile);
        const ext = path.extname(selectedFile.path).toLowerCase().slice(1);
        const fileName = path.basename(selectedFile.path);

        if (['png', 'jpg', 'jpeg'].includes(ext)) {
            const base64 = Buffer.from(fileContent).toString('base64');
            panel.webview.postMessage({
                type: 'ai-reply',
                text: `🖼️ ![${fileName}](data:image/${ext};base64,${base64})`
            });
        } else if (['txt', 'js', 'ts', 'md'].includes(ext)) {
            const contentStr = new TextDecoder('utf-8').decode(fileContent);
            panel.webview.postMessage({
                type: 'ai-reply',
                text: `📎 ${fileName}\n\`\`\`${ext}\n${contentStr.slice(0, 300)}${contentStr.length > 300 ? '...' : ''}\n\`\`\``
            });
        } else {
            panel.webview.postMessage({
                type: 'ai-reply',
                text: `⚠️ Unsupported file type: .${ext}`
            });
        }
    } catch (error) {
        console.error('File read error:', error);
        panel.webview.postMessage({
            type: 'error',
            text: 'Failed to process file attachment'
        });
    }
}

async function handleDeepSeekQuery(client: OpenAI, panel: vscode.WebviewPanel, userMessage: string) {
    if (!userMessage.trim()) {
        panel.webview.postMessage({
            type: 'ai-reply',
            text: 'Please enter a message to send to DeepSeek'
        });
        return;
    }

    try {
        panel.webview.postMessage({
            type: 'status',
            text: '🔍 Thinking...'
        });

        const completion = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { 
                    role: 'system', 
                    content: 'You are DeepSeek AI, a helpful coding assistant. ' +
                             'Provide concise, accurate responses with code examples when appropriate.'
                },
                { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        const reply = completion.choices[0]?.message?.content || '🤖 No response from DeepSeek';
        panel.webview.postMessage({
            type: 'ai-reply',
            text: reply
        });
    } catch (error) {
        console.error('DeepSeek API error:', error);
        panel.webview.postMessage({
            type: 'error',
            text: '⚠️ DeepSeek API Error: ' + 
                  (error instanceof Error ? error.message : 'Connection failed')
        });
    }
}

export function deactivate() {}
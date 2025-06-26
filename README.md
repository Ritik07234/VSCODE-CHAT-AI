<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  
     
</head>
<body>

  <h1>💬 VS Code AI Chat Extension (Powered by DeepSeek LLM)</h1>
  <p>
    A custom-built VS Code extension that integrates a React-based chat assistant panel. This assistant uses DeepSeek LLM API for AI responses and supports file-aware contextual inputs using <code>@filename</code> syntax.
  </p>

  <h2>✨ Key Features</h2>
  <ul>
    <li>⚛️ React-based chat UI in a VS Code WebView</li>
    <li>📂 File reference using <code>@filename</code> to attach files in messages</li>
    <li>🧠 DeepSeek LLM-powered code generation and understanding</li>
    <li>💡 Markdown + syntax highlighting for code blocks</li>
  </ul>

  <h2>📦 Installation</h2>
  <ol>
    <li>Clone or download this repository</li>
    <li>Run <code>npm install</code> to install dependencies</li>
    <li>Package the extension using <code>vsce package</code></li>
    <li>Install the generated <code>.vsix</code> file into VS Code</li>
  </ol>

  <h2>🚀 Usage</h2>
  <ol>
    <li>Open the Command Palette (<code>Ctrl+Shift+P</code>)</li>
    <li>Run: <code>Chat: Open Chat Panel</code></li>
    <li>Start chatting with the assistant</li>
    <li>Use <code>@filename</code> to attach and ask about workspace files</li>
  </ol>

  <h2>🔐 Requirements</h2>
  <ul>
    <li>🗝️ DeepSeek LLM API Key (set in your config file or environment)</li>
    <li>Node.js and npm</li>
    <li>VS Code installed</li>
  </ul>

  <h2>🧠 Example Prompt</h2>
  <pre><code>@package.json what does this script mean?</code></pre>

  <h2>🛠️ Configuration</h2>
  <p>Store your DeepSeek API key securely, either in:</p>
  <ul>
    <li><code>.env</code> file as <code>DEEPSEEK_API_KEY=your_key_here</code></li>
    <li>Or directly inside <code>config.ts</code> during development</li>
  </ul>

  <h2>📁 Tech Stack</h2>
  <ul>
    <li><strong>Frontend</strong>: React + TypeScript (WebView)</li>
    <li><strong>Backend</strong>: Node.js + VS Code Extension API</li>
    <li><strong>LLM</strong>: DeepSeek API for code generation</li>
  </ul>

  <hr/>
  <p><strong>Built with ❤️ by Ritik Kumar Singh</strong></p>

</body>
</html>

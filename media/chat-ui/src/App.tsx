import { useState, useEffect } from 'react';
import './App.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // You can choose another theme if you like

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

// @ts-ignore
const vscode = acquireVsCodeApi(); // Bridge to VS Code extension

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, newMsg]);

    if (input.includes('@')) {
      const filename = input.split('@')[1].split(' ')[0];
      vscode.postMessage({
        type: 'mention',
        filename,
      });
    } else {
      vscode.postMessage({
        type: 'user-message',
        text: input,
      });
    }

    setInput('');
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'ai-reply') {
        const aiMsg: Message = { sender: 'ai', text: message.text };
        setMessages((prev) => [...prev, aiMsg]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender === 'user' ? 'user' : 'ai'}`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {msg.text}
            </ReactMarkdown>
          </div>
        ))}
      </div>
      <div className="input-bar">
        <input
          type="text"
          value={input}
          placeholder="Type your message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;

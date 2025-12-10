import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

export const Example21 = mount(() => {
  const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quick Notes App - Lithent HTM Tags</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      color: #333;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .header p {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .input-section {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .input-section input {
      width: 100%;
      padding: 12px 16px;
      font-size: 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 12px;
      transition: border-color 0.2s;
    }

    .input-section input:focus {
      outline: none;
      border-color: #667eea;
    }

    .input-section textarea {
      width: 100%;
      padding: 12px 16px;
      font-size: 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      resize: vertical;
      min-height: 100px;
      margin-bottom: 12px;
      font-family: inherit;
      transition: border-color 0.2s;
    }

    .input-section textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-primary {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    .stats {
      background: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      text-align: center;
    }

    .stats strong {
      color: #667eea;
      font-size: 1.2rem;
    }

    .notes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .note-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }

    .note-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 12px rgba(0,0,0,0.15);
    }

    .note-card h3 {
      color: #667eea;
      margin-bottom: 12px;
      font-size: 1.3rem;
    }

    .note-card p {
      color: #4a5568;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .note-card .timestamp {
      font-size: 0.85rem;
      color: #a0aec0;
      margin-bottom: 12px;
    }

    .btn-delete {
      width: 100%;
      padding: 8px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-delete:hover {
      background: #dc2626;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: white;
    }

    .empty-state-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    .info-box {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 16px;
      border-radius: 12px;
      margin-top: 20px;
      color: white;
    }

    .info-box strong {
      display: block;
      margin-bottom: 8px;
      font-size: 1.1rem;
    }

    .info-box ul {
      list-style: none;
      padding-left: 0;
    }

    .info-box li {
      padding: 4px 0;
      padding-left: 20px;
      position: relative;
    }

    .info-box li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #a7f3d0;
    }
  </style>
</head>
<body>
  <div id="app"></div>

  <!-- Import map for ES modules from CDN -->
  <script type="importmap">
  {
    "imports": {
      "lithent": "https://cdn.jsdelivr.net/npm/lithent/dist/lithent.mjs",
      "lithent/helper": "https://cdn.jsdelivr.net/npm/lithent/helper/dist/lithentHelper.mjs",
      "lithent/tag": "https://cdn.jsdelivr.net/npm/lithent/tag/dist/lithentTag.mjs"
    }
  }
  </script>

  <script type="module">
    // Import from CDN using import map
    import { lmount, render } from 'lithent';
    import { lstate } from 'lithent/helper';
    import { lTag } from 'lithent/tag';

    // Notes App Component
    const NotesApp = lmount(() => {
      // State
      const title = lstate('');
      const content = lstate('');
      const notes = lstate([]);

      // Add new note
      const addNote = () => {
        if (!title.value.trim() || !content.value.trim()) {
          alert('Please fill in both title and content!');
          return;
        }

        const newNote = {
          id: Date.now(),
          title: title.value,
          content: content.value,
          timestamp: new Date().toLocaleString()
        };

        notes.value = [...notes.value, newNote];
        title.value = '';
        content.value = '';
      };

      // Delete note
      const deleteNote = (id) => {
        if (confirm('Delete this note?')) {
          notes.value = notes.value.filter(note => note.id !== id);
        }
      };

      // Handle Enter key in title input
      const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addNote();
        }
      };

      return () => lTag\`
        <div class="container">
          <div class="header">
            <h1>📝 Quick Notes</h1>
            <p>HTM Tags + CDN = No Build Required!</p>
          </div>

          <div class="input-section">
            <input
              type="text"
              placeholder="Note title..."
              value=\${title.value}
              onInput=\${(e) => { title.value = e.target.value; }}
              onKeyPress=\${handleKeyPress}
            />
            <textarea
              placeholder="Write your note content here..."
              value=\${content.value}
              onInput=\${(e) => { content.value = e.target.value; }}
            ></textarea>
            <button class="btn-primary" onClick=\${addNote}>
              ➕ Add Note
            </button>
          </div>

          <div class="stats">
            <strong>\${notes.value.length}</strong> \${notes.value.length === 1 ? 'note' : 'notes'} saved
          </div>

          \${notes.value.length === 0 ? lTag\`
            <div class="empty-state">
              <div class="empty-state-icon">📭</div>
              <h3>No notes yet</h3>
              <p>Create your first note above!</p>
            </div>
          \` : lTag\`
            <div class="notes-grid">
              \${notes.value.map(note => lTag\`
                <div class="note-card" key=\${note.id}>
                  <h3>\${note.title}</h3>
                  <div class="timestamp">\${note.timestamp}</div>
                  <p>\${note.content}</p>
                  <button class="btn-delete" onClick=\${() => deleteNote(note.id)}>
                    🗑️ Delete
                  </button>
                </div>
              \`)}
            </div>
          \`}

          <div class="info-box">
            <strong>💡 HTM Tags Features:</strong>
            <ul>
              <li>Tagged template literals syntax</li>
              <li>No build tools or transpiler needed</li>
              <li>Load directly from CDN with import maps</li>
              <li>Reactive state management with lstate</li>
              <li>JSX-like authoring experience</li>
            </ul>
          </div>
        </div>
      \`;
    });

    // Render app
    render(lTag\`<\${NotesApp} />\`, document.getElementById('app'));
  </script>
</body>
</html>`;

  return () => (
    <div class="w-full max-w-4xl mx-auto">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          📝 Quick Notes App with HTM Tags
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Complete HTML file ready to use - Just save and open in browser!
        </p>
      </div>

      <CodeBlock language="html" code={htmlCode} />

      <div class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p class="text-xs text-blue-800 dark:text-blue-200 mb-2">
          <strong>💡 How to use this example:</strong>
        </p>
        <ol class="text-xs text-blue-700 dark:text-blue-300 ml-4 space-y-1">
          <li>1. Copy the entire HTML code above</li>
          <li>
            2. Save it as a <strong>.html</strong> file (e.g., notes-app.html)
          </li>
          <li>3. Open the file in your browser - it works immediately!</li>
          <li>
            4. <strong>No build tools, no npm, no configuration needed</strong>
          </li>
        </ol>
      </div>

      <div class="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
        <p class="text-xs text-purple-800 dark:text-purple-200 mb-2">
          <strong>🎯 Key Technologies:</strong>
        </p>
        <ul class="text-xs text-purple-700 dark:text-purple-300 ml-4 space-y-1">
          <li>
            • <strong>Import Maps:</strong> Load ES modules from CDN without
            bundler
          </li>
          <li>
            • <strong>HTM Tags (lTag):</strong> JSX-like syntax with template
            literals
          </li>
          <li>
            • <strong>lstate:</strong> Reactive state management from
            lithent/helper
          </li>
          <li>
            • <strong>Zero Build:</strong> Pure browser-native ES modules
          </li>
        </ul>
      </div>
    </div>
  );
});

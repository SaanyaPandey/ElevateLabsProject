export const DEFAULT_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>My Project</title>
  </head>
  <body>
    <div class="card">
      <h1>Hello, World!</h1>
      <p>Edit the HTML, CSS, and JS tabs to see live updates.</p>
      <button id="btn">Click me</button>
    </div>
  </body>
</html>`

export const DEFAULT_CSS = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
}

.card {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  text-align: center;
  max-width: 400px;
}

h1 {
  color: #667eea;
  margin-bottom: 1rem;
}

p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

button:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}`

export const DEFAULT_JS = `const btn = document.getElementById('btn');
let count = 0;

btn.addEventListener('click', () => {
  count++;
  btn.textContent = \`Clicked \${count} time\${count > 1 ? 's' : ''}\`;
});`

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { css as cssLang } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import {
  FileCode2,
  Palette,
  Braces,
  Play,
  Save,
  RotateCcw,
  Loader2,
  Check,
  AlertCircle,
  Download,
  Upload,
  Terminal,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { fetchProject, createProject, updateProject } from '../lib/projectsApi'
import { DEFAULT_HTML, DEFAULT_CSS, DEFAULT_JS } from '../lib/defaultCode'

const TABS = [
  { id: 'html', label: 'HTML', icon: FileCode2, lang: html },
  { id: 'css', label: 'CSS', icon: Palette, lang: cssLang },
  { id: 'js', label: 'JS', icon: Braces, lang: javascript },
]

export default function Editor() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('id')

  const [activeTab, setActiveTab] = useState('html')
  const [code, setCode] = useState({ html: DEFAULT_HTML, css: DEFAULT_CSS, js: DEFAULT_JS })
  const [projectName, setProjectName] = useState('Untitled Project')
  const [projectDescription, setProjectDescription] = useState('')
  const [loading, setLoading] = useState(!!projectId)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [previewKey, setPreviewKey] = useState(0)
  const [consoleMessages, setConsoleMessages] = useState([])
  const [consoleOpen, setConsoleOpen] = useState(true)
  const iframeRef = useRef(null)
  const consoleEndRef = useRef(null)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    fetchProject(projectId)
      .then((data) => {
        if (cancelled || !data) return
        setCode({ html: data.html || '', css: data.css || '', js: data.js || '' })
        setProjectName(data.name || 'Untitled Project')
        setProjectDescription(data.description || '')
      })
      .catch(() => {
        if (!cancelled) setSaveStatus({ type: 'error', message: 'Failed to load project' })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [projectId])

  const buildPreview = useCallback(() => {
    const consoleHook = `<script>
(function() {
  var orig = { log: console.log, warn: console.warn, error: console.error, info: console.info };
  function serialize(args) {
    return Array.prototype.map.call(args, function(a) {
      if (a === null) return 'null';
      if (a === undefined) return 'undefined';
      if (typeof a === 'string') return a;
      if (a instanceof Error) return a.name + ': ' + a.message + (a.stack ? '\\n' + a.stack : '');
      try { return JSON.stringify(a, null, 2); } catch(e) { return String(a); }
    }).join(' ');
  }
  function send(type, args) {
    parent.postMessage({ source: 'codecraft-preview', type: type, message: serialize(args) }, '*');
  }
  console.log = function() { orig.log.apply(console, arguments); send('log', arguments); };
  console.warn = function() { orig.warn.apply(console, arguments); send('warn', arguments); };
  console.error = function() { orig.error.apply(console, arguments); send('error', arguments); };
  console.info = function() { orig.info.apply(console, arguments); send('info', arguments); };
  window.addEventListener('error', function(e) {
    send('error', [e.message + ' (' + (e.filename || '').replace(/^.*\\//, '') + ':' + e.lineno + ':' + e.colno + ')']);
  });
  window.addEventListener('unhandledrejection', function(e) {
    var msg = 'Unhandled Promise Rejection';
    if (e.reason) msg += ': ' + (e.reason.message || String(e.reason));
    send('error', [msg]);
  });
})();
<\/script>`;

    let previewHtml = '';
    const hasHtmlTag = /<html/i.test(code.html);
    const hasHeadTag = /<head/i.test(code.html);
    const hasBodyTag = /<body/i.test(code.html);

    if (hasHtmlTag || hasBodyTag || hasHeadTag) {
      let tempHtml = code.html;
      const injectHead = `${consoleHook}\n<style>${code.css}</style>`;
      if (hasHeadTag) {
        tempHtml = tempHtml.replace(/<head([^>]*)>/i, `<head$1>\n${injectHead}`);
      } else if (hasHtmlTag) {
        tempHtml = tempHtml.replace(/<html([^>]*)>/i, `<html$1>\n<head>\n${injectHead}\n</head>`);
      } else {
        tempHtml = `<head>\n${injectHead}\n</head>\n${tempHtml}`;
      }

      const injectJs = `<script>\ntry {\n${code.js}\n} catch(e) {\n  console.error(e);\n}\n<\/script>`;
      if (tempHtml.includes('</body>')) {
        previewHtml = tempHtml.replace('</body>', `${injectJs}\n</body>`);
      } else if (tempHtml.includes('</html>')) {
        previewHtml = tempHtml.replace('</html>', `${injectJs}\n</html>`);
      } else {
        previewHtml = `${tempHtml}\n${injectJs}`;
      }
    } else {
      previewHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
${consoleHook}
<style>${code.css}</style>
</head>
<body>
${code.html}
<script>
try {
${code.js}
} catch(e) {
  console.error(e);
}
</script>
</body>
</html>`;
    }

    return previewHtml;
  }, [code])

  useEffect(() => {
    if (!autoRefresh) return
    const timeout = setTimeout(() => {
      setPreviewKey((k) => k + 1)
    }, 400)
    return () => clearTimeout(timeout)
  }, [code, autoRefresh])

  useEffect(() => {
    const handler = (e) => {
      if (e.data && e.data.source === 'codecraft-preview') {
        setConsoleMessages((prev) => [...prev, { type: e.data.type, message: e.data.message, id: Date.now() + Math.random() }])
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  useEffect(() => {
    setConsoleMessages([])
  }, [previewKey])

  useEffect(() => {
    if (consoleOpen && consoleEndRef.current) {
      consoleEndRef.current.scrollTop = consoleEndRef.current.scrollHeight
    }
  }, [consoleMessages, consoleOpen])

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus(null)
    try {
      if (projectId) {
        await updateProject(projectId, {
          name: projectName,
          description: projectDescription,
          html: code.html,
          css: code.css,
          js: code.js,
        })
        setSaveStatus({ type: 'success', message: 'Project saved' })
      } else {
        const created = await createProject({
          name: projectName,
          description: projectDescription,
          html: code.html,
          css: code.css,
          js: code.js,
        })
        setSaveStatus({ type: 'success', message: 'Project created' })
        navigate(`/editor?id=${created.id}`, { replace: true })
      }
    } catch {
      setSaveStatus({ type: 'error', message: 'Save failed — please try again' })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const handleReset = () => {
    setCode({ html: DEFAULT_HTML, css: DEFAULT_CSS, js: DEFAULT_JS })
    setPreviewKey((k) => k + 1)
  }

  const handleDownload = () => {
    const blob = new Blob([buildPreview()], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'project'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      setCode((prev) => ({ ...prev, html: text }))
      setActiveTab('html')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const activeTabConfig = TABS.find((t) => t.id === activeTab) || TABS[0]

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="border-b border-neutral-200 bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="text-sm font-semibold text-neutral-900 bg-transparent border-none focus:outline-none focus:ring-0 px-1 py-1 rounded hover:bg-neutral-50 min-w-[140px] flex-1 max-w-[280px]"
          placeholder="Project name"
        />
        <input
          type="text"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          className="text-sm text-neutral-500 bg-transparent border-none focus:outline-none focus:ring-0 px-1 py-1 rounded hover:bg-neutral-50 min-w-[120px] flex-1 max-w-[240px]"
          placeholder="Add a description..."
        />

        <div className="flex items-center gap-2 ml-auto">
          {saveStatus && (
            <span
              className={`flex items-center gap-1.5 text-sm animate-fade-in ${
                saveStatus.type === 'success' ? 'text-success-600' : 'text-error-600'
              }`}
            >
              {saveStatus.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {saveStatus.message}
            </span>
          )}

          <label className="btn-ghost cursor-pointer" title="Import HTML file">
            <Upload className="w-4 h-4" />
            <span className="hidden lg:inline">Import</span>
            <input type="file" accept=".html,.htm" onChange={handleImport} className="hidden" />
          </label>

          <button onClick={handleDownload} className="btn-ghost" title="Download as HTML">
            <Download className="w-4 h-4" />
            <span className="hidden lg:inline">Export</span>
          </button>

          <button onClick={handleReset} className="btn-ghost" title="Reset to template">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden lg:inline">Reset</span>
          </button>

          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {projectId ? 'Save' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-200">
          <div className="flex items-center bg-neutral-800 border-b border-neutral-700 px-2">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'text-white border-primary-500 bg-neutral-700/50'
                      : 'text-neutral-400 border-transparent hover:text-neutral-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
            <label className="ml-auto flex items-center gap-2 text-xs text-neutral-400 cursor-pointer pr-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded accent-primary-500"
              />
              Auto
            </label>
          </div>

          <div className="flex-1 overflow-hidden bg-neutral-900">
            <CodeMirror
              value={code[activeTab]}
              height="100%"
              theme={vscodeDark}
              extensions={[activeTabConfig.lang()]}
              onChange={(val) => setCode((prev) => ({ ...prev, [activeTab]: val }))}
              basicSetup={{
                foldGutter: true,
                autocompletion: true,
                highlightActiveLine: true,
              }}
            />
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col bg-white min-h-0">
          <div className="flex items-center justify-between bg-neutral-100 border-b border-neutral-200 px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <Play className="w-4 h-4 text-primary-500" />
              Live Preview
            </div>
            <button
              onClick={() => setPreviewKey((k) => k + 1)}
              className="btn-ghost text-xs px-2.5 py-1.5"
              title="Refresh preview"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
          <div className="flex-1 bg-white relative min-h-0 overflow-hidden">
            <iframe
              key={previewKey}
              ref={iframeRef}
              srcDoc={buildPreview()}
              title="Live Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-modals"
            />
          </div>

          <div className={`flex flex-col border-t border-neutral-700 bg-neutral-900 ${consoleOpen ? 'h-44' : 'h-auto'}`}>
            <div className="flex items-center justify-between px-3 py-2 bg-neutral-800 border-b border-neutral-700">
              <button
                onClick={() => setConsoleOpen((o) => !o)}
                className="flex items-center gap-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
              >
                <Terminal className="w-4 h-4 text-primary-400" />
                Console
                {consoleMessages.length > 0 && (
                  <span className="badge bg-neutral-700 text-neutral-300 px-1.5 py-0.5 text-xs">
                    {consoleMessages.length}
                  </span>
                )}
                {consoleOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setConsoleMessages([])}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-neutral-700"
                title="Clear console"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
            {consoleOpen && (
              <div ref={consoleEndRef} className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 font-mono text-xs space-y-1 min-h-0">
                {consoleMessages.length === 0 ? (
                  <div className="text-neutral-500 italic py-2">Console is empty</div>
                ) : (
                  consoleMessages.map((msg) => {
                    const icons = {
                      log: { icon: Info, color: 'text-neutral-300', bg: '' },
                      info: { icon: Info, color: 'text-primary-400', bg: '' },
                      warn: { icon: AlertTriangle, color: 'text-warning-400', bg: 'bg-warning-500/10' },
                      error: { icon: XCircle, color: 'text-error-400', bg: 'bg-error-500/10' },
                    }
                    const cfg = icons[msg.type] || icons.log
                    const Icon = cfg.icon
                    return (
                      <div key={msg.id} className={`flex items-start gap-2 px-2 py-1 rounded ${cfg.bg}`}>
                        <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                        <pre className={`whitespace-pre-wrap break-words ${cfg.color} leading-relaxed`}>{msg.message}</pre>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

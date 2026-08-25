import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  Plus,
  Loader2,
  Trash2,
  PencilLine,
  Search,
  AlertCircle,
  FileCode2,
  Clock,
} from 'lucide-react'
import { fetchProjects, deleteProject, createProject } from '../lib/projectsApi'
import { DEFAULT_HTML, DEFAULT_CSS, DEFAULT_JS } from '../lib/defaultCode'

export default function Projects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [creating, setCreating] = useState(false)

  const loadProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProjects()
      setProjects(data)
    } catch {
      setError('Failed to load projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      await deleteProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
      setConfirmDelete(null)
    } catch {
      setError('Failed to delete project.')
    } finally {
      setDeleting(false)
    }
  }

  const handleNewProject = async () => {
    setCreating(true)
    try {
      const created = await createProject({
        name: 'Untitled Project',
        html: DEFAULT_HTML,
        css: DEFAULT_CSS,
        js: DEFAULT_JS,
      })
      navigate(`/editor?id=${created.id}`)
    } catch {
      setError('Failed to create project.')
      setCreating(false)
    }
  }

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-primary-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">My Projects</h1>
            </div>
            <p className="text-neutral-600 ml-13">
              {projects.length} saved {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>

          <button onClick={handleNewProject} disabled={creating} className="btn-primary">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            New project
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 rounded-lg bg-error-50 border border-error-200 px-4 py-3 text-error-700 text-sm animate-slide-down">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-error-500 hover:text-error-700">
              Dismiss
            </button>
          </div>
        )}

        <div className="relative mb-6">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 max-w-md"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <FileCode2 className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {search ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-neutral-500 mb-6">
              {search
                ? `No projects match "${search}".`
                : 'Create your first project to get started.'}
            </p>
            {!search && (
              <button onClick={handleNewProject} disabled={creating} className="btn-primary">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((project, i) => (
              <div
                key={project.id}
                className="card p-5 hover:shadow-md hover:border-primary-200 transition-all duration-300 animate-slide-up group flex flex-col"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center flex-shrink-0">
                    <FileCode2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <button
                    onClick={() => setConfirmDelete(project)}
                    className="text-neutral-300 hover:text-error-500 transition-colors p-1 -mr-1"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link to={`/editor?id=${project.id}`} className="flex-1 block">
                  <h3 className="text-base font-semibold text-neutral-900 mb-1 group-hover:text-primary-700 transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-neutral-500 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-3">
                    <Clock className="w-3.5 h-3.5" />
                    Updated {formatDate(project.updated_at)}
                  </div>
                </Link>

                <Link
                  to={`/editor?id=${project.id}`}
                  className="btn-secondary text-sm mt-4 w-full"
                >
                  <PencilLine className="w-4 h-4" />
                  Open editor
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative card p-6 max-w-sm w-full animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-error-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-error-500" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 text-center mb-2">
              Delete project?
            </h3>
            <p className="text-sm text-neutral-600 text-center mb-6">
              "{confirmDelete.name}" will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-secondary flex-1"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="btn-danger flex-1"
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

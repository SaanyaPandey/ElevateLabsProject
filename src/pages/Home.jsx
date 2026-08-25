import { Link } from 'react-router-dom'
import { Code2, Eye, Save, FolderKanban, Zap, Layers, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Code2,
    title: 'Multi-language editor',
    description: 'Write HTML, CSS, and JavaScript with syntax highlighting and a professional code editor.',
  },
  {
    icon: Eye,
    title: 'Live preview',
    description: 'See your changes instantly in a live preview pane as you type. No refresh needed.',
  },
  {
    icon: Save,
    title: 'Save & manage projects',
    description: 'Save your work to the cloud and pick up right where you left off from any device.',
  },
  {
    icon: Zap,
    title: 'Lightning fast',
    description: 'Built on Vite and React for instant loads and smooth editing without the wait.',
  },
  {
    icon: Layers,
    title: 'Clean workspace',
    description: 'A distraction-free interface that keeps your code front and center.',
  },
  {
    icon: FolderKanban,
    title: 'Project library',
    description: 'Browse, open, and manage all your saved projects from a single dashboard.',
  },
]

export default function Home() {
  return (
    <div className="flex-1">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 via-white to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <span className="badge bg-primary-100 text-primary-700 mb-6">
              <Zap className="w-3.5 h-3.5" />
              Write code in your browser
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
              Code anywhere,{' '}
              <span className="text-primary-600">right in your browser</span>
            </h1>
            <p className="text-lg text-neutral-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              CodeCraft is an online code editor for HTML, CSS, and JavaScript.
              Write, preview, and save your projects — all without leaving your browser.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/editor" className="btn-primary text-base px-6 py-3">
                Start coding
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/projects" className="btn-secondary text-base px-6 py-3">
                <FolderKanban className="w-4 h-4" />
                My projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
            Everything you need to build
          </h2>
          <p className="text-lg text-neutral-600">
            A clean, focused environment for front-end development.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className="card p-6 hover:shadow-md hover:border-primary-200 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
                <Icon className="w-5.5 h-5.5 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to start building?
            </h2>
            <p className="text-lg text-neutral-300 mb-8 max-w-xl mx-auto">
              Open the editor and start writing code. Your work is saved automatically to your project library.
            </p>
            <Link to="/editor" className="btn-primary text-base px-6 py-3">
              Launch the editor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

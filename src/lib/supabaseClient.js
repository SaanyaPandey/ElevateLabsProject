import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// LocalStorage mock for Supabase when env vars are missing
const getLocalStorageProjects = () => {
  const data = localStorage.getItem('codecraft_projects')
  return data ? JSON.parse(data) : []
}

const saveLocalStorageProjects = (projects) => {
  localStorage.setItem('codecraft_projects', JSON.stringify(projects))
}

const mockSupabase = {
  from(table) {
    if (table !== 'projects') {
      return {
        select: () => ({ order: () => Promise.resolve({ data: [], error: null }) })
      }
    }

    return {
      select(fields = '*') {
        return {
          order(field, { ascending = true } = {}) {
            let projects = getLocalStorageProjects()
            projects.sort((a, b) => {
              const valA = a[field]
              const valB = b[field]
              if (valA < valB) return ascending ? -1 : 1
              if (valA > valB) return ascending ? 1 : -1
              return 0
            })
            return Promise.resolve({ data: projects, error: null })
          },
          eq(field, value) {
            return {
              async maybeSingle() {
                const projects = getLocalStorageProjects()
                const project = projects.find(p => p[field] === value)
                return { data: project || null, error: null }
              },
              async single() {
                const projects = getLocalStorageProjects()
                const project = projects.find(p => p[field] === value)
                if (!project) {
                  return { data: null, error: new Error('Not found') }
                }
                return { data: project, error: null }
              }
            }
          },
          async maybeSingle() {
            const projects = getLocalStorageProjects()
            return { data: projects[0] || null, error: null }
          }
        }
      },
      insert(payload) {
        return {
          select() {
            return {
              async single() {
                const projects = getLocalStorageProjects()
                const newProject = {
                  id: Math.random().toString(36).substring(2, 11),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  ...payload
                }
                projects.push(newProject)
                saveLocalStorageProjects(projects)
                return { data: newProject, error: null }
              }
            }
          }
        }
      },
      update(payload) {
        return {
          eq(field, value) {
            return {
              select() {
                return {
                  async maybeSingle() {
                    const projects = getLocalStorageProjects()
                    const idx = projects.findIndex(p => p[field] === value)
                    if (idx === -1) {
                      return { data: null, error: new Error('Not found') }
                    }
                    const updatedProject = {
                      ...projects[idx],
                      ...payload,
                      updated_at: new Date().toISOString()
                    }
                    projects[idx] = updatedProject
                    saveLocalStorageProjects(projects)
                    return { data: updatedProject, error: null }
                  }
                }
              }
            }
          }
        }
      },
      delete() {
        return {
          async eq(field, value) {
            const projects = getLocalStorageProjects()
            const filtered = projects.filter(p => p[field] !== value)
            saveLocalStorageProjects(filtered)
            return { error: null }
          }
        }
      }
    }
  }
}

export const supabase =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === 'your-supabase-url' ||
  supabaseAnonKey === 'your-supabase-anon-key'
    ? mockSupabase
    : createClient(supabaseUrl, supabaseAnonKey)

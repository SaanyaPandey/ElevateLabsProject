const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${API_BASE_URL}/api/projects`;

export async function fetchProjects() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  const data = await response.json();
  return data.map((p) => ({
    id: p._id,
    name: p.title,
    description: p.description,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }));
}

export async function fetchProject(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch project');
  }
  const p = await response.json();
  return {
    id: p._id,
    name: p.title,
    description: p.description,
    html: p.html,
    css: p.css,
    js: p.js,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export async function createProject({ name, description = '', html = '', css = '', js = '' }) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: name,
      description,
      html,
      css,
      js,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to create project');
  }
  const p = await response.json();
  return {
    id: p._id,
    name: p.title,
    description: p.description,
    html: p.html,
    css: p.css,
    js: p.js,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export async function updateProject(id, updates) {
  // Map updates.name to title if it exists
  const body = { ...updates };
  if (body.name !== undefined) {
    body.title = body.name;
    delete body.name;
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error('Failed to update project');
  }
  const p = await response.json();
  return {
    id: p._id,
    name: p.title,
    description: p.description,
    html: p.html,
    css: p.css,
    js: p.js,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export async function deleteProject(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete project');
  }
}

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Project from './models/Project.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not defined.');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes

app.get('/', (req, res) => {
  console.log('GET / - Status check requested');
  res.json({ message: 'Knotic Backend API is running successfully' });
});

// 1. Fetch all projects (sorted by updated time)
app.get('/api/projects', async (req, res) => {
  console.log('GET /api/projects - Fetching all projects from database');
  try {
    const projects = await Project.find({}, 'title description html css js createdAt updatedAt').sort({ updatedAt: -1 });
    console.log(`GET /api/projects - Successfully fetched ${projects.length} project(s)`);
    res.json(projects);
  } catch (error) {
    console.error('GET /api/projects - Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 2. Fetch single project by ID
app.get('/api/projects/:id', async (req, res) => {
  console.log(`GET /api/projects/${req.params.id} - Fetching project details`);
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      console.warn(`GET /api/projects/${req.params.id} - Project not found`);
      return res.status(404).json({ error: 'Project not found' });
    }
    console.log(`GET /api/projects/${req.params.id} - Successfully fetched project: "${project.title}"`);
    res.json(project);
  } catch (error) {
    console.error(`GET /api/projects/${req.params.id} - Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// 3. Create project
app.post('/api/projects', async (req, res) => {
  const { title, description, html, css, js } = req.body;
  console.log(`POST /api/projects - Creating project: "${title || 'Untitled Project'}"`);
  try {
    const project = new Project({
      title: title || 'Untitled Project',
      description: description || '',
      html: html || '',
      css: css || '',
      js: js || '',
    });
    await project.save();
    console.log(`POST /api/projects - Successfully created project with ID: ${project._id}`);
    res.status(201).json(project);
  } catch (error) {
    console.error('POST /api/projects - Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 4. Update project by ID
app.put('/api/projects/:id', async (req, res) => {
  const { title, description, html, css, js } = req.body;
  console.log(`PUT /api/projects/${req.params.id} - Request to update project: "${title || ''}"`);
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      console.warn(`PUT /api/projects/${req.params.id} - Project not found`);
      return res.status(404).json({ error: 'Project not found' });
    }

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (html !== undefined) project.html = html;
    if (css !== undefined) project.css = css;
    if (js !== undefined) project.js = js;

    await project.save();
    console.log(`PUT /api/projects/${req.params.id} - Successfully updated project: "${project.title}"`);
    res.json(project);
  } catch (error) {
    console.error(`PUT /api/projects/${req.params.id} - Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// 5. Delete project by ID
app.delete('/api/projects/:id', async (req, res) => {
  console.log(`DELETE /api/projects/${req.params.id} - Request to delete project`);
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      console.warn(`DELETE /api/projects/${req.params.id} - Project not found`);
      return res.status(404).json({ error: 'Project not found' });
    }
    console.log(`DELETE /api/projects/${req.params.id} - Successfully deleted project: "${project.title}"`);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(`DELETE /api/projects/${req.params.id} - Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Connect to MongoDB and start server
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB database successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected from MongoDB');
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize MongoDB connection:', error);
    process.exit(1);
  });

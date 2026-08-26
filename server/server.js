import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Project from './models/Project.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/knotic';

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// 1. Fetch all projects (sorted by updated time)
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find({}, 'title description html css js createdAt updatedAt').sort({ updatedAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Fetch single project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Create project
app.post('/api/projects', async (req, res) => {
  try {
    const { title, description, html, css, js } = req.body;
    const project = new Project({
      title: title || 'Untitled Project',
      description: description || '',
      html: html || '',
      css: css || '',
      js: js || '',
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Update project by ID
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { title, description, html, css, js } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (html !== undefined) project.html = html;
    if (css !== undefined) project.css = css;
    if (js !== undefined) project.js = js;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Delete project by ID
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });

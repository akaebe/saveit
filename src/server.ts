import express from 'express';
import path from 'path';
import { testDBConnection, getTodos, getTodoById, createTodo, updateTodo, deleteTodo } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files from the 'public' directory

// Route to check database connection status
app.get('/status', async (req, res) => {
  try {
    await testDBConnection();
    res.json({ message: 'Database is connected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to the database' });
  }
});

// Serve the frontend index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// To-Do Routes
app.get('/todos', async (req, res) => {
  try {
    const todos = await getTodos();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos' });
  }
});

app.get('/todos/:id', async (req, res) => {
  try {
    const todo = await getTodoById(Number(req.params.id));
    if (todo) {
      res.json(todo);
    } else {
      res.status(404).send('To-Do not found');
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todo' });
  }
});

app.post('/todos', async (req, res) => {
  const { title, priority } = req.body;
  if (title && priority !== undefined) {
    try {
      const newTodo = await createTodo(title, priority);
      res.status(201).json(newTodo);
    } catch (error) {
      res.status(500).json({ message: 'Error creating todo' });
    }
  } else {
    res.status(400).send('Title and priority are required');
  }
});

app.put('/todos/:id', async (req, res) => {
  const id = Number(req.params.id);
  const updates = req.body;
  try {
    const updatedTodo = await updateTodo(id, updates);
    if (updatedTodo) {
      res.json(updatedTodo);
    } else {
      res.status(404).send('To-Do not found');
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo' });
  }
});

app.delete('/todos/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const deleted = await deleteTodo(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).send('To-Do not found');
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo' });
  }
});

// Start the server and test the database connection
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // Test the MariaDB connection
  try {
    await testDBConnection();
    console.log('Database is connected successfully');
  } catch (error) {
    console.error('Error connecting to the database');
  }
});
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const cors = require('cors');
app.use(cors()); // Add CORS middleware
app.use(express_1.default.json()); // For parsing application/json
app.use(express_1.default.static(path_1.default.join(__dirname, '../public'))); // Serve static files from the 'public' directory
// Route to check database connection status
app.get('/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.testDBConnection)();
        res.json({ message: 'Database is connected successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error connecting to the database' });
    }
}));
// Serve the frontend index.html file
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
// To-Do Routes
app.get('/todos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = yield (0, db_1.getTodos)();
        res.json(todos);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching todos' });
    }
}));
app.get('/todos/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todo = yield (0, db_1.getTodoById)(Number(req.params.id));
        if (todo) {
            res.json(todo);
        }
        else {
            res.status(404).send('To-Do not found');
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching todo' });
    }
}));
app.post('/todos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, priority, deadline } = req.body;
    if (title && priority !== undefined && deadline !== undefined) {
        try {
            const newTodo = yield (0, db_1.createTodo)(title, priority, new Date(deadline));
            res.status(201).json(newTodo);
        }
        catch (error) {
            res.status(500).json({ message: 'Error creating todo' });
        }
    }
    else {
        res.status(400).send('Title, priority, and deadline are required');
    }
}));
app.put('/todos/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const updates = req.body;
    try {
        const updatedTodo = yield (0, db_1.updateTodo)(id, updates);
        if (updatedTodo) {
            res.json(updatedTodo);
        }
        else {
            res.status(404).send('To-Do not found');
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating todo' });
    }
}));
app.delete('/todos/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    try {
        const deleted = yield (0, db_1.deleteTodo)(id);
        if (deleted) {
            res.status(204).send();
        }
        else {
            res.status(404).send('To-Do not found');
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting todo' });
    }
}));
// Start the server and test the database connection
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server is running on http://localhost:${PORT}`);
    // Test the MariaDB connection
    try {
        yield (0, db_1.testDBConnection)();
        console.log('Database is connected successfully');
    }
    catch (error) {
        console.error('Error connecting to the database');
    }
}));

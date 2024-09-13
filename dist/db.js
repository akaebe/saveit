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
exports.deleteTodo = exports.updateTodo = exports.createTodo = exports.getTodoById = exports.getTodos = exports.testDBConnection = exports.pool = void 0;
const mariadb_1 = __importDefault(require("mariadb"));
exports.pool = mariadb_1.default.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Ebenezer@123',
    database: 'notes_db',
    connectionLimit: 5,
});
const testDBConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    let conn;
    try {
        conn = yield exports.pool.getConnection();
        console.log('Connected to MariaDB database successfully!');
    }
    catch (error) {
        console.error('Error connecting to MariaDB:', error);
        throw error;
    }
    finally {
        if (conn)
            conn.release();
    }
});
exports.testDBConnection = testDBConnection;
const getTodos = () => __awaiter(void 0, void 0, void 0, function* () {
    let conn;
    try {
        conn = yield exports.pool.getConnection();
        const rows = yield conn.query('SELECT * FROM todos ORDER BY priority DESC, id ASC');
        return rows;
    }
    catch (error) {
        console.error('Error fetching todos:', error);
        throw error;
    }
    finally {
        if (conn)
            conn.release();
    }
});
exports.getTodos = getTodos;
const getTodoById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let conn;
    try {
        conn = yield exports.pool.getConnection();
        const rows = yield conn.query('SELECT * FROM todos WHERE id = ?', [id]);
        return rows[0];
    }
    catch (error) {
        console.error('Error fetching todo:', error);
        throw error;
    }
    finally {
        if (conn)
            conn.release();
    }
});
exports.getTodoById = getTodoById;
const createTodo = (title, priority, deadline) => __awaiter(void 0, void 0, void 0, function* () {
    let conn;
    try {
        conn = yield exports.pool.getConnection();
        const result = yield conn.query('INSERT INTO todos (title, completed, priority, deadline) VALUES (?, ?, ?, ?)', [title, false, priority, deadline]);
        return { id: result.insertId, title, completed: false, priority, deadline };
    }
    catch (error) {
        console.error('Error creating todo:', error);
        throw error;
    }
    finally {
        if (conn)
            conn.release();
    }
});
exports.createTodo = createTodo;
const updateTodo = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    let conn;
    try {
        conn = yield exports.pool.getConnection();
        const { title, completed, priority } = updates;
        let query = 'UPDATE todos SET ';
        const params = [];
        if (title !== undefined) {
            query += 'title = ?, ';
            params.push(title);
        }
        if (completed !== undefined) {
            query += 'completed = ?, ';
            params.push(completed);
        }
        if (priority !== undefined) {
            query += 'priority = ?, ';
            params.push(priority);
        }
        query = query.slice(0, -2); // Remove the last comma and space
        query += ' WHERE id = ?';
        params.push(id);
        yield conn.query(query, params);
        return (0, exports.getTodoById)(id);
    }
    catch (error) {
        console.error('Error updating todo:', error);
        throw error;
    }
    finally {
        if (conn)
            conn.release();
    }
});
exports.updateTodo = updateTodo;
const deleteTodo = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let conn;
    try {
        conn = yield exports.pool.getConnection();
        const result = yield conn.query('DELETE FROM todos WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
    catch (error) {
        console.error('Error deleting todo:', error);
        throw error;
    }
    finally {
        if (conn)
            conn.release();
    }
});
exports.deleteTodo = deleteTodo;

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTodo = exports.updateTodo = exports.addTodo = exports.getTodoById = exports.getTodos = void 0;
// Import pool from db.ts or wherever your DB connection is defined.
const db_1 = require("./db");
const getTodos = () => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield db_1.pool.getConnection();
    try {
        const rows = yield conn.query('SELECT * FROM todos');
        return rows;
    }
    finally {
        conn.release();
    }
});
exports.getTodos = getTodos;
const getTodoById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield db_1.pool.getConnection();
    try {
        const rows = yield conn.query('SELECT * FROM todos WHERE id = ?', [id]);
        return rows[0];
    }
    finally {
        conn.release();
    }
});
exports.getTodoById = getTodoById;
const addTodo = (title) => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield db_1.pool.getConnection();
    try {
        const result = yield conn.query('INSERT INTO todos (title, completed, priority) VALUES (?, ?, ?)', [title, false, false]);
        const id = result.insertId;
        return { id, title, completed: false, priority: false };
    }
    finally {
        conn.release();
    }
});
exports.addTodo = addTodo;
const updateTodo = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield db_1.pool.getConnection();
    try {
        yield conn.query('UPDATE todos SET title = COALESCE(?, title), completed = COALESCE(?, completed), priority = COALESCE(?, priority) WHERE id = ?', [updates.title, updates.completed, updates.priority, id]);
        return (0, exports.getTodoById)(id);
    }
    finally {
        conn.release();
    }
});
exports.updateTodo = updateTodo;
const deleteTodo = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield db_1.pool.getConnection();
    try {
        const result = yield conn.query('DELETE FROM todos WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
    finally {
        conn.release();
    }
});
exports.deleteTodo = deleteTodo;

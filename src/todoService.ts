import { Pool } from 'mariadb';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: boolean;
}

// Import pool from db.ts or wherever your DB connection is defined.
import { pool } from './db';

export const getTodos = async (): Promise<Todo[]> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT * FROM todos');
    return rows as Todo[];
  } finally {
    conn.release();
  }
};

export const getTodoById = async (id: number): Promise<Todo | undefined> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT * FROM todos WHERE id = ?', [id]);
    return rows[0] as Todo | undefined;
  } finally {
    conn.release();
  }
};

export const addTodo = async (title: string): Promise<Todo> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      'INSERT INTO todos (title, completed, priority) VALUES (?, ?, ?)',
      [title, false, false]
    );
    const id = result.insertId;
    return { id, title, completed: false, priority: false };
  } finally {
    conn.release();
  }
};

export const updateTodo = async (id: number, updates: Partial<Todo>): Promise<Todo | undefined> => {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'UPDATE todos SET title = COALESCE(?, title), completed = COALESCE(?, completed), priority = COALESCE(?, priority) WHERE id = ?',
      [updates.title, updates.completed, updates.priority, id]
    );
    return getTodoById(id);
  } finally {
    conn.release();
  }
};

export const deleteTodo = async (id: number): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query('DELETE FROM todos WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};

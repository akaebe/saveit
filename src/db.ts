import mariadb from 'mariadb';

export const pool = mariadb.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Ebenezer@123',
  database: 'notes_db',
  connectionLimit: 5,
});

export const testDBConnection = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Connected to MariaDB database successfully!');
  } catch (error) {
    console.error('Error connecting to MariaDB:', error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

export const getTodos = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM todos ORDER BY priority DESC, id ASC');
    return rows;
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

export const getTodoById = async (id: number) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM todos WHERE id = ?', [id]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching todo:', error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

export const createTodo = async (title: string, priority: number, deadline: Date) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO todos (title, completed, priority, deadline) VALUES (?, ?, ?, ?)',
      [title, false, priority, deadline]
    );
    return { id: result.insertId, title, completed: false, priority, deadline };
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

export const updateTodo = async (id: number, updates: { title?: string; completed?: boolean; priority?: number }) => {
  let conn;
  try {
    conn = await pool.getConnection();
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

    await conn.query(query, params);
    return getTodoById(id);
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

export const deleteTodo = async (id: number) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query('DELETE FROM todos WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
};
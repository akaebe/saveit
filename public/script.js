document.getElementById('todoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const priority = document.getElementById('priority').value;

  if (!title) {
    showError('Please enter a valid to-do title.');
    return;
  }

  // Fetch existing todos and check if duplicate exists
  const todos = await fetchTodos();
  const duplicateTodo = todos.find(todo => todo.title.toLowerCase() === title.toLowerCase());

  if (duplicateTodo) {
    showError('This item is already in the to-do list.');
    return;
  }

  // Add new todo if no duplicate found
  await fetch('/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, priority }),
  });

  document.getElementById('title').value = '';
  document.getElementById('priority').value = '';
  await loadTodos();
  hideError();  // Clear error message after successful addition
});

// Function to fetch todos
async function fetchTodos() {
  const response = await fetch('/todos');
  return await response.json();
}

// Function to show error message
function showError(message) {
  const errorElement = document.getElementById('error-message');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}

// Function to hide error message
function hideError() {
  const errorElement = document.getElementById('error-message');
  errorElement.style.display = 'none';
}

async function loadTodos() {
  const response = await fetch('/todos');
  const todos = await response.json();
  const todoList = document.getElementById('todoList');
  todoList.innerHTML = '';

  todos.sort((a, b) => b.priority - a.priority).forEach((todo) => {
    const li = document.createElement('li');
    li.className = todo.completed ? 'completed' : '';

    let priorityText = '';
    if (todo.priority > 1) {
      priorityText = `
        <span class="priority-badge priority-${todo.priority}">
          ${['Low', 'Medium', 'High'][todo.priority - 1]}
        </span>`;
    }

    li.innerHTML = `
      <span class="checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo.id}">
        <img src="icons/check-mark.png" alt="Checkmark" />
      </span>
      <span class="delete-icon" data-id="${todo.id}">
        <img src="icons/dustbin.png" alt="Trash Icon" />
      </span>
      <span class="edit-icon" data-id="${todo.id}">
        <img src="icons/edit.png" alt="Edit Icon" />
      </span>
      <span class="todo-text">${todo.title}</span>
      <input type="text" class="edit-input" value="${todo.title}" style="display:none;">
      ${priorityText}
    `;

    todoList.appendChild(li);
  });

  addEventListeners();
}

document.getElementById('themeToggle').addEventListener('change', function () {
  document.body.classList.toggle('dark-mode', this.checked);
  localStorage.setItem('dark-mode', this.checked ? 'enabled' : 'disabled');
});

window.addEventListener('DOMContentLoaded', () => {
  const darkModePreference = localStorage.getItem('dark-mode');
  if (darkModePreference === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeToggle').checked = true;
  }
});

function addEventListeners() {
  document.querySelectorAll('.checkbox').forEach((checkbox) => {
    checkbox.addEventListener('click', toggleTodo);
  });
  document.querySelectorAll('.edit-icon').forEach((edit) => {
    edit.addEventListener('click', editTodo);
  });
  document.querySelectorAll('.delete-icon').forEach((deleteIcon) => {
    deleteIcon.addEventListener('click', deleteTodo);
  });
}

async function toggleTodo(event) {
  const id = event.target.closest('.checkbox').getAttribute('data-id');
  const completed = !event.target.classList.contains('checked');
  await updateTodo(id, { completed });
}

async function editTodo(event) {
  const li = event.target.closest('li');
  const todoText = li.querySelector('.todo-text');
  const editInput = li.querySelector('.edit-input');

  if (todoText.style.display === 'none') {
    const newTitle = editInput.value;
    const id = event.target.closest('.edit-icon').getAttribute('data-id');
    await updateTodo(id, { title: newTitle });
  } else {
    todoText.style.display = 'none';
    editInput.style.display = 'inline-block';
    editInput.focus();
  }

  editInput.addEventListener('blur', async () => {
    const newTitle = editInput.value;
    const id = event.target.closest('.edit-icon').getAttribute('data-id');
    await updateTodo(id, { title: newTitle });

    todoText.textContent = newTitle;
    todoText.style.display = 'inline-block';
    editInput.style.display = 'none';
  }, { once: true });
}

async function updateTodo(id, updates) {
  try {
    const response = await fetch(`/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (response.ok) {
      await loadTodos();
    } else {
      console.error('Failed to update todo');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function deleteTodo(event) {
  const id = event.target.closest('.delete-icon').getAttribute('data-id');
  try {
    const response = await fetch(`/todos/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      await loadTodos();
    } else {
      console.error('Failed to delete todo');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

loadTodos();
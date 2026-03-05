const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const saveBtn = document.getElementById('save-btn');
const removeBtn = document.getElementById('remove-btn');
const storageDuration = document.getElementById('storage-duration');
const STORAGE_KEY = 'ai-todo-list';
let todos = [];

function renderTodos() {
	todoList.innerHTML = '';
	todos.forEach((todo, idx) => {
		const li = document.createElement('li');
		li.setAttribute('draggable', !todo.editing);
		li.setAttribute('data-idx', idx);
		if (todo.editing) {
			const input = document.createElement('input');
			input.type = 'text';
			input.value = todo.text;
			input.className = 'edit-input';
			input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') saveEdit(idx, input.value);
				if (e.key === 'Escape') cancelEdit(idx);
			});
			input.addEventListener('blur', () => cancelEdit(idx));
			li.appendChild(input);
			input.focus();
		} else {
			const span = document.createElement('span');
			span.className = 'todo-text';
			span.textContent = todo.text;
			li.appendChild(span);
		}
		const actions = document.createElement('div');
		actions.className = 'actions';
		if (!todo.editing) {
			const editBtn = document.createElement('button');
			editBtn.className = 'edit';
			editBtn.title = 'Edit';
			editBtn.innerHTML = '✏️';
			editBtn.onclick = () => editTodo(idx);
			actions.appendChild(editBtn);
		}
		const delBtn = document.createElement('button');
		delBtn.className = 'delete';
		delBtn.title = 'Delete';
		delBtn.innerHTML = '🗑️';
		delBtn.onclick = () => deleteTodo(idx);
		actions.appendChild(delBtn);
		const upBtn = document.createElement('button');
		upBtn.className = 'up';
		upBtn.title = 'Move Up';
		upBtn.innerHTML = '⬆️';
		upBtn.disabled = idx === 0;
		upBtn.onclick = () => moveTodo(idx, -1);
		actions.appendChild(upBtn);
		const downBtn = document.createElement('button');
		downBtn.className = 'down';
		downBtn.title = 'Move Down';
		downBtn.innerHTML = '⬇️';
		downBtn.disabled = idx === todos.length - 1;
		downBtn.onclick = () => moveTodo(idx, 1);
		actions.appendChild(downBtn);
		li.appendChild(actions);

		if (!todo.editing) {
			li.addEventListener('dragstart', handleDragStart);
			li.addEventListener('dragover', handleDragOver);
			li.addEventListener('dragleave', handleDragLeave);
			li.addEventListener('drop', handleDrop);
			li.addEventListener('dragend', handleDragEnd);
		}

		todoList.appendChild(li);
	});
}

let dragSrcIdx = null;

function handleDragStart(e) {
	dragSrcIdx = Number(this.getAttribute('data-idx'));
	this.classList.add('dragging');
	e.dataTransfer.effectAllowed = 'move';
}
function handleDragOver(e) {
	e.preventDefault();
	if (!this.classList.contains('drag-over')) {
		this.classList.add('drag-over');
	}
	e.dataTransfer.dropEffect = 'move';
}
function handleDragLeave(e) {
	this.classList.remove('drag-over');
}
function handleDrop(e) {
	e.preventDefault();
	this.classList.remove('drag-over');
	const targetIdx = Number(this.getAttribute('data-idx'));
	if (dragSrcIdx !== null && dragSrcIdx !== targetIdx) {
		const [moved] = todos.splice(dragSrcIdx, 1);
		todos.splice(targetIdx, 0, moved);
		renderTodos();
	}
	dragSrcIdx = null;
}
function handleDragEnd(e) {
	this.classList.remove('dragging');
	const items = document.querySelectorAll('#todo-list li');
	items.forEach(item => item.classList.remove('drag-over'));
}

todoForm.onsubmit = function(e) {
	e.preventDefault();
	const text = todoInput.value.trim();
	if (text) {
		todos.push({ text, editing: false });
		todoInput.value = '';
		renderTodos();
	}
};

function saveTodosToStorage() {
	const days = parseInt(storageDuration.value, 10);
	const now = Date.now();
	const expiry = now + days * 24 * 60 * 60 * 1000;
	const data = { todos, expiry };
	localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	alert('Todo list saved for ' + days + ' day' + (days > 1 ? 's' : ''));
}

function loadTodosFromStorage() {
	const data = localStorage.getItem(STORAGE_KEY);
	if (!data) return false;
	try {
		const parsed = JSON.parse(data);
		if (parsed.expiry && parsed.expiry > Date.now() && Array.isArray(parsed.todos)) {
			todos = parsed.todos;
			return true;
		} else {
			localStorage.removeItem(STORAGE_KEY);
			return false;
		}
	} catch {
		return false;
	}
}

function removeTodosFromStorage() {
	localStorage.removeItem(STORAGE_KEY);
	alert('Todo list removed from storage.');
}

function syncTodosInStorageIfPresent() {
	const data = localStorage.getItem(STORAGE_KEY);
	if (!data) return;
	try {
		const parsed = JSON.parse(data);
		if (parsed.expiry && parsed.expiry > Date.now()) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos, expiry: parsed.expiry }));
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	} catch {
		localStorage.removeItem(STORAGE_KEY);
	}
}

saveBtn.onclick = saveTodosToStorage;
removeBtn.onclick = removeTodosFromStorage;

if (!loadTodosFromStorage()) {
	todos = [];
}
renderTodos();

function editTodo(idx) {
	todos = todos.map((todo, i) => ({ ...todo, editing: i === idx }));
	renderTodos();
}
function saveEdit(idx, value) {
	todos[idx].text = value.trim() || todos[idx].text;
	todos[idx].editing = false;
	renderTodos();
}
function cancelEdit(idx) {
	todos[idx].editing = false;
	renderTodos();
}
function deleteTodo(idx) {
	todos.splice(idx, 1);
	syncTodosInStorageIfPresent();
	renderTodos();
}
function moveTodo(idx, dir) {
	const newIdx = idx + dir;
	if (newIdx < 0 || newIdx >= todos.length) return;
	const [item] = todos.splice(idx, 1);
	todos.splice(newIdx, 0, item);
	renderTodos();
}
renderTodos();

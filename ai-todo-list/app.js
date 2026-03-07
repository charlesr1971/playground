const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const saveBtn = document.getElementById('save-btn');
const saveAllBtn = document.getElementById('save-all-btn');
const removeBtn = document.getElementById('remove-btn');
const storageDuration = document.getElementById('storage-duration');
const nameModalOverlay = document.getElementById('name-modal-overlay');
const nameModalCloseBtn = document.getElementById('name-modal-close');
const nameModalContent = document.getElementById('name-modal-content');
const STORAGE_KEY = 'ai-todo-list';
let todos = [];

function formatDate(dateValue) {
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return '';
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return year + '-' + month + '-' + day;
}

function formatDateTime(dateValue) {
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return '';
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

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
			/* input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') saveEdit(idx, input.value);
				if (e.key === 'Escape') cancelEdit(idx);
			});
			input.addEventListener('blur', () => cancelEdit(idx)); */
			let isFinished = false;

			input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					isFinished = true;
					saveEdit(idx, input.value);
				}
				if (e.key === 'Escape') {
					isFinished = true;
					cancelEdit(idx);
				}
			});

			// Fix for Mobile & Desktop: Save when clicking/tapping away
			input.addEventListener('blur', () => {
				if (!isFinished) {
					saveEdit(idx, input.value);
				}
			});
			li.appendChild(input);
			/* input.focus(); */
			// Small delay ensures the focus works reliably on mobile Safari
			setTimeout(() => input.focus(), 0);
		} else {
			const span = document.createElement('span');
			span.className = 'todo-text';
			span.textContent = todo.text;
			li.appendChild(span);
		}
		const dateSpan = document.createElement('span');
		dateSpan.className = 'todo-date';
		dateSpan.textContent = formatDate(todo.createdAt);
		li.appendChild(dateSpan);
		const modifiedSpan = document.createElement('span');
		modifiedSpan.className = 'todo-modified';
		modifiedSpan.textContent = formatDateTime(todo.modifiedAt);
		li.appendChild(modifiedSpan);
		const actions = document.createElement('div');
		actions.className = 'actions';
		if (!todo.editing) {
			const viewBtn = document.createElement('button');
			viewBtn.className = 'fa fa-eye view';
			viewBtn.title = 'View Full Name';
			// viewBtn.innerHTML = '👁️';
			viewBtn.innerHTML = '';
			viewBtn.onclick = () => openNameModal(todo.text);
			actions.appendChild(viewBtn);

			const editBtn = document.createElement('button');
			editBtn.className = 'fa fa-pencil edit';
			editBtn.title = 'Edit';
			// editBtn.innerHTML = '✏️';
			editBtn.innerHTML = '';
			editBtn.onclick = () => editTodo(idx);
			actions.appendChild(editBtn);
		}
		const delBtn = document.createElement('button');
		delBtn.className = 'fa fa-minus-circle delete';
		delBtn.title = 'Delete';
		// delBtn.innerHTML = '🗑️';
		delBtn.innerHTML = '';
		delBtn.onclick = () => deleteTodo(idx);
		actions.appendChild(delBtn);
		const upBtn = document.createElement('button');
		upBtn.className = 'fa fa-arrow-circle-up up';
		upBtn.title = 'Move Up';
		// upBtn.innerHTML = '⬆️';
		upBtn.innerHTML = '';
		upBtn.disabled = idx === 0;
		upBtn.onclick = () => moveTodo(idx, -1);
		actions.appendChild(upBtn);
		const downBtn = document.createElement('button');
		downBtn.className = 'fa fa-arrow-circle-down down';
		downBtn.title = 'Move Down';
		// downBtn.innerHTML = '⬇️';
		downBtn.innerHTML = '';
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
		syncTodosInStorageIfPresent();
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
		const now = new Date().toISOString();
		todos.push({ text, createdAt: now, modifiedAt: now, editing: false });
		todoInput.value = '';
		syncTodosInStorageIfPresent();
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
			todos = parsed.todos.map((todo) => ({
				text: todo.text || '',
				createdAt: todo.createdAt || new Date().toISOString(),
				modifiedAt: todo.modifiedAt || todo.createdAt || new Date().toISOString(),
				editing: false
			}));
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
	alert('All todo items removed from storage.');
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

function openNameModal(text) {
	nameModalContent.textContent = text;
	nameModalOverlay.classList.add('open');
	nameModalOverlay.setAttribute('aria-hidden', 'false');
}

function closeNameModal() {
	nameModalOverlay.classList.remove('open');
	nameModalOverlay.setAttribute('aria-hidden', 'true');
}

saveBtn.onclick = saveTodosToStorage;
saveAllBtn.onclick = saveTodosToStorage;
removeBtn.onclick = removeTodosFromStorage;
nameModalCloseBtn.onclick = closeNameModal;
nameModalOverlay.addEventListener('click', (e) => {
	if (e.target === nameModalOverlay) {
		closeNameModal();
	}
});
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape' && nameModalOverlay.classList.contains('open')) {
		closeNameModal();
	}
});

if (!loadTodosFromStorage()) {
	todos = [];
}
renderTodos();

function editTodo(idx) {
	todos = todos.map((todo, i) => ({ ...todo, editing: i === idx }));
	renderTodos();
}

function saveEdit(idx, value) {
	const newValue = value.trim();
	if (newValue && newValue !== todos[idx].text) {
		todos[idx].text = newValue;
		todos[idx].modifiedAt = new Date().toISOString();
	}
	todos[idx].editing = false;
	syncTodosInStorageIfPresent();
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
	syncTodosInStorageIfPresent();
	renderTodos();
}
renderTodos();
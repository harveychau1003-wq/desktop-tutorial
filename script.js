// 待辦事項應用程序的主要邏輯

class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.idCounter = 0;
        this.init();
    }

    init() {
        this.loadTodos();
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // 添加待辦事項
        const addBtn = document.getElementById('addBtn');
        const todoInput = document.getElementById('todoInput');

        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // 過濾按鈕
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // 清除已完成
        const clearCompleted = document.getElementById('clearCompleted');
        clearCompleted.addEventListener('click', () => this.clearCompleted());
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (text === '') {
            return;
        }

        const todo = {
            id: this.generateUniqueId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        input.value = '';
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        // 確保 ID 匹配（處理字符串和數字類型的 ID）
        const todo = this.todos.find(t => String(t.id) === String(id));
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        // 確保 ID 匹配（處理字符串和數字類型的 ID）
        this.todos = this.todos.filter(t => String(t.id) !== String(id));
        this.saveTodos();
        this.render();
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            return;
        }

        if (confirm(`確定要清除 ${completedCount} 個已完成的任務嗎？`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        const todoCount = document.getElementById('todoCount');
        const filteredTodos = this.getFilteredTodos();

        // 更新計數
        const activeCount = this.todos.filter(t => !t.completed).length;
        todoCount.textContent = `${activeCount} 個待辦事項`;

        // 清空列表
        todoList.innerHTML = '';

        // 顯示/隱藏空狀態
        if (filteredTodos.length === 0) {
            emptyState.classList.add('show');
        } else {
            emptyState.classList.remove('show');
        }

        // 渲染待辦事項
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="todoApp.toggleTodo(${todo.id})"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button 
                    class="delete-btn" 
                    onclick="todoApp.deleteTodo(${todo.id})"
                >
                    刪除
                </button>
            `;

            todoList.appendChild(li);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        if (saved) {
            try {
                this.todos = JSON.parse(saved);
                // 初始化 ID counter 為現有 todos 的數量，確保新 ID 不會與現有 ID 衝突
                // 新的 ID 格式包含時間戳、計數器和隨機數，即使 counter 從 0 開始也不會衝突
                // 但為了更好的唯一性，我們將 counter 設置為現有 todos 的數量
                this.idCounter = this.todos.length;
            } catch (e) {
                console.error('載入待辦事項失敗:', e);
                this.todos = [];
                this.idCounter = 0;
            }
        }
    }

    generateUniqueId() {
        // 使用時間戳 + 遞增計數器 + 隨機數確保唯一性
        this.idCounter++;
        return `${Date.now()}-${this.idCounter}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

// 初始化應用程序
const todoApp = new TodoApp();


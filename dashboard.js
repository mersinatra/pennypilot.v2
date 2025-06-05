// Dashboard interactivity and API integration

document.addEventListener('DOMContentLoaded', () => {
    // Add smooth transitions
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.style.transition = 'all 0.2s ease';
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.bg-dark-card');
    cards.forEach(card => {
        card.style.transition = 'transform 0.2s ease';
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Mobile navigation functionality
    const mobileNavButtons = document.querySelectorAll('.lg\\:hidden button');
    mobileNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            mobileNavButtons.forEach(btn => {
                btn.classList.remove('bg-accent-blue', 'text-white');
                btn.classList.add('text-gray-400');
            });
            button.classList.remove('text-gray-400');
            button.classList.add('bg-accent-blue', 'text-white');
        });
    });

    // Desktop navigation functionality
    const desktopNavButtons = document.querySelectorAll('.hidden.lg\\:flex nav a');
    desktopNavButtons.forEach(button => {
        button.addEventListener('click', e => {
            e.preventDefault();
            desktopNavButtons.forEach(btn => {
                btn.classList.remove('bg-accent-blue', 'text-white');
                btn.classList.add('text-gray-400');
            });
            button.classList.remove('text-gray-400');
            button.classList.add('bg-accent-blue', 'text-white');
        });
    });

    // Animate charts on load
    const paths = document.querySelectorAll('svg path');
    paths.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.style.animation = 'drawLine 2s ease-in-out forwards';
    });

    // Add CSS animation for line drawing
    const style = document.createElement('style');
    style.textContent = `@keyframes drawLine { to { stroke-dashoffset: 0; } }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }`;
    document.head.appendChild(style);

    // Add hover class to cards
    cards.forEach(card => card.classList.add('hover-lift'));

    // load initial data
    loadCategories().then(() => populateCategorySelect());
    loadTransactions();
    loadBudgets();
    loadRecurringItems();

    // form handlers
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', e => {
            e.preventDefault();
            createCategory();
        });
    }

    const transactionForm = document.getElementById('transaction-form');
    if (transactionForm) {
        transactionForm.addEventListener('submit', e => {
            e.preventDefault();
            createTransaction();
        });
    }

    const budgetForm = document.getElementById('budget-form');
    if (budgetForm) {
        budgetForm.addEventListener('submit', e => {
            e.preventDefault();
            createBudget();
        });
    }

    const recurringForm = document.getElementById('recurring-form');
    if (recurringForm) {
        recurringForm.addEventListener('submit', e => {
            e.preventDefault();
            createRecurringItem();
        });
    }
});

// ------- API helpers -------
async function api(url, options={}) {
    options.headers = Object.assign({'Content-Type': 'application/json'}, options.headers || {});
    const res = await fetch(url, options);
    if (!res.ok) throw new Error('API request failed');
    if (res.status !== 204) return res.json();
}

// Categories
async function loadCategories() {
    const list = document.getElementById('categories-list');
    if (!list) return;
    try {
        const data = await api('/categories');
        list.innerHTML = '';
        if (data.length === 0) {
            list.textContent = 'No categories';
            return;
        }
        data.forEach(c => {
            const row = document.createElement('div');
            row.className = 'flex justify-between';
            row.innerHTML = `<span>${c.name}</span>
                <div>
                    <button class="text-xs text-blue-400 mr-2" onclick="editCategory(${c.id}, '${c.name}')">Edit</button>
                    <button class="text-xs text-red-400" onclick="deleteCategory(${c.id})">Delete</button>
                </div>`;
            list.appendChild(row);
        });
    } catch (err) {
        list.textContent = 'Failed to load categories';
    }
}

async function populateCategorySelect() {
    const select = document.getElementById('transaction-category');
    if (!select) return;
    try {
        const data = await api('/categories');
        select.innerHTML = data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch (err) {
        select.innerHTML = '<option value="1">Uncategorized</option>';
    }
}

async function createCategory() {
    const input = document.getElementById('category-name');
    const name = input.value.trim();
    if (!name) return;
    await api('/categories', {method: 'POST', body: JSON.stringify({name})});
    input.value = '';
    loadCategories();
    populateCategorySelect();
}

async function editCategory(id, current) {
    const name = prompt('Category name', current);
    if (!name) return;
    await api(`/categories/${id}`, {method: 'PUT', body: JSON.stringify({name})});
    loadCategories();
    populateCategorySelect();
}

async function deleteCategory(id) {
    if (!confirm('Delete category?')) return;
    await api(`/categories/${id}`, {method: 'DELETE'});
    loadCategories();
    populateCategorySelect();
}

// Transactions
async function loadTransactions() {
    const list = document.getElementById('transactions-list');
    if (!list) return;
    try {
        const data = await api('/transactions');
        list.innerHTML = '';
        if (data.length === 0) {
            list.textContent = 'No transactions';
            return;
        }
        data.forEach(t => {
            const row = document.createElement('div');
            row.className = 'flex justify-between';
            row.innerHTML = `<span>${t.description} - $${t.amount}</span>
                <div>
                    <button class="text-xs text-blue-400 mr-2" onclick="editTransaction(${t.id})">Edit</button>
                    <button class="text-xs text-red-400" onclick="deleteTransaction(${t.id})">Delete</button>
                </div>`;
            list.appendChild(row);
        });
    } catch (err) {
        list.textContent = 'Failed to load transactions';
    }
}

async function createTransaction() {
    const desc = document.getElementById('transaction-desc').value.trim();
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const date = document.getElementById('transaction-date').value;
    const category = parseInt(document.getElementById('transaction-category').value);
    if (!desc || isNaN(amount)) return;
    await api('/transactions', {method: 'POST', body: JSON.stringify({description: desc, amount, date, category_id: category})});
    document.getElementById('transaction-desc').value = '';
    document.getElementById('transaction-amount').value = '';
    loadTransactions();
}

async function editTransaction(id) {
    const desc = prompt('Description');
    if (desc === null) return;
    const amount = prompt('Amount');
    if (amount === null) return;
    await api(`/transactions/${id}`, {method: 'PUT', body: JSON.stringify({description: desc, amount: parseFloat(amount)})});
    loadTransactions();
}

async function deleteTransaction(id) {
    if (!confirm('Delete transaction?')) return;
    await api(`/transactions/${id}`, {method: 'DELETE'});
    loadTransactions();
}

// Budgets
async function loadBudgets() {
    const list = document.getElementById('budgets-list');
    if (!list) return;
    try {
        const data = await api('/budgets');
        list.innerHTML = '';
        if (data.length === 0) {
            list.textContent = 'No budgets';
            return;
        }
        data.forEach(b => {
            const row = document.createElement('div');
            row.className = 'flex justify-between';
            row.innerHTML = `<span>${b.name} - $${b.amount}</span>
                <div>
                    <button class="text-xs text-blue-400 mr-2" onclick="editBudget(${b.id})">Edit</button>
                    <button class="text-xs text-red-400" onclick="deleteBudget(${b.id})">Delete</button>
                </div>`;
            list.appendChild(row);
        });
    } catch (err) {
        list.textContent = 'Failed to load budgets';
    }
}

async function createBudget() {
    const name = document.getElementById('budget-name').value.trim();
    const amount = parseFloat(document.getElementById('budget-amount').value);
    const start = document.getElementById('budget-start').value;
    const end = document.getElementById('budget-end').value;
    if (!name || isNaN(amount) || !start) return;
    await api('/budgets', {method: 'POST', body: JSON.stringify({name, amount, start_date: start, end_date: end})});
    document.getElementById('budget-name').value = '';
    document.getElementById('budget-amount').value = '';
    loadBudgets();
}

async function editBudget(id) {
    const name = prompt('Name');
    if (name === null) return;
    const amount = prompt('Amount');
    if (amount === null) return;
    await api(`/budgets/${id}`, {method: 'PUT', body: JSON.stringify({name, amount: parseFloat(amount)})});
    loadBudgets();
}

async function deleteBudget(id) {
    if (!confirm('Delete budget?')) return;
    await api(`/budgets/${id}`, {method: 'DELETE'});
    loadBudgets();
}

// Recurring items
async function loadRecurringItems() {
    const list = document.getElementById('recurring-list');
    if (!list) return;
    try {
        const data = await api('/recurring_items');
        list.innerHTML = '';
        if (data.length === 0) {
            list.textContent = 'No recurring items';
            return;
        }
        data.forEach(r => {
            const row = document.createElement('div');
            row.className = 'flex justify-between';
            row.innerHTML = `<span>${r.name} - $${r.amount}</span>
                <div>
                    <button class="text-xs text-blue-400 mr-2" onclick="editRecurring(${r.id})">Edit</button>
                    <button class="text-xs text-red-400" onclick="deleteRecurring(${r.id})">Delete</button>
                </div>`;
            list.appendChild(row);
        });
    } catch (err) {
        list.textContent = 'Failed to load recurrings';
    }
}

async function createRecurringItem() {
    const name = document.getElementById('recurring-name').value.trim();
    const amount = parseFloat(document.getElementById('recurring-amount').value);
    const frequency = document.getElementById('recurring-frequency').value.trim();
    const next = document.getElementById('recurring-next').value;
    if (!name || isNaN(amount) || !frequency || !next) return;
    await api('/recurring_items', {method: 'POST', body: JSON.stringify({name, amount, frequency, next_due_date: next})});
    document.getElementById('recurring-name').value = '';
    document.getElementById('recurring-amount').value = '';
    loadRecurringItems();
}

async function editRecurring(id) {
    const name = prompt('Name');
    if (name === null) return;
    const amount = prompt('Amount');
    if (amount === null) return;
    await api(`/recurring_items/${id}`, {method: 'PUT', body: JSON.stringify({name, amount: parseFloat(amount)})});
    loadRecurringItems();
}

async function deleteRecurring(id) {
    if (!confirm('Delete recurring item?')) return;
    await api(`/recurring_items/${id}`, {method: 'DELETE'});
    loadRecurringItems();
}

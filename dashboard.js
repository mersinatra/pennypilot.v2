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

    // navigation functionality
    function showPage(name) {
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        const page = document.getElementById(`page-${name}`);
        if (page) page.classList.remove('hidden');
    }

    const mobileNavButtons = document.querySelectorAll('.lg\\:hidden button');
    mobileNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            mobileNavButtons.forEach(btn => {
                btn.classList.remove('bg-accent-blue', 'text-white');
                btn.classList.add('text-gray-400');
            });
            button.classList.remove('text-gray-400');
            button.classList.add('bg-accent-blue', 'text-white');
            showPage(button.dataset.page);
        });
    });

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
            showPage(button.dataset.page);
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

    // modal helpers
    const openModal = id => document.getElementById(id)?.classList.remove('hidden');
    const closeModal = id => document.getElementById(id)?.classList.add('hidden');

    function openTransactionModal() {
        document.getElementById('transaction-id').value = '';
        document.getElementById('transaction-desc').value = '';
        document.getElementById('transaction-amount').value = '';
        document.getElementById('transaction-date').value = '';
        openModal('transaction-modal');
    }

    function openBudgetModal() {
        document.getElementById('budget-id').value = '';
        document.getElementById('budget-name').value = '';
        document.getElementById('budget-amount').value = '';
        document.getElementById('budget-start').value = '';
        document.getElementById('budget-end').value = '';
        openModal('budget-modal');
    }

    function openRecurringModal() {
        document.getElementById('recurring-id').value = '';
        document.getElementById('recurring-name').value = '';
        document.getElementById('recurring-amount').value = '';
        document.getElementById('recurring-frequency').value = '';
        document.getElementById('recurring-next').value = '';
        openModal('recurring-modal');
    }

    document.getElementById('open-transaction-modal')?.addEventListener('click', openTransactionModal);
    document.getElementById('open-transaction-modal-page')?.addEventListener('click', openTransactionModal);
    document.getElementById('close-transaction-modal')?.addEventListener('click', () => closeModal('transaction-modal'));

    document.getElementById('open-category-modal')?.addEventListener('click', () => openModal('category-modal'));
    document.getElementById('open-category-modal-page')?.addEventListener('click', () => openModal('category-modal'));
    document.getElementById('close-category-modal')?.addEventListener('click', () => closeModal('category-modal'));

    document.getElementById('open-budget-modal')?.addEventListener('click', openBudgetModal);
    document.getElementById('close-budget-modal')?.addEventListener('click', () => closeModal('budget-modal'));

    document.getElementById('open-recurring-modal')?.addEventListener('click', openRecurringModal);
    document.getElementById('open-recurring-modal-page')?.addEventListener('click', openRecurringModal);
    document.getElementById('close-recurring-modal')?.addEventListener('click', () => closeModal('recurring-modal'));

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
            submitTransactionForm();
        });
    }

    const budgetForm = document.getElementById('budget-form');
    if (budgetForm) {
        budgetForm.addEventListener('submit', e => {
            e.preventDefault();
            submitBudgetForm();
        });
    }

    const recurringForm = document.getElementById('recurring-form');
    if (recurringForm) {
        recurringForm.addEventListener('submit', e => {
            e.preventDefault();
            submitRecurringForm();
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
    const lists = [
        document.getElementById('categories-list'),
        document.getElementById('categories-page-list')
    ].filter(Boolean);
    if (lists.length === 0) return;
    try {
        const data = await api('/categories');
        lists.forEach(l => l.innerHTML = '');
        if (data.length === 0) {
            lists.forEach(l => l.textContent = 'No categories');
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
            lists.forEach(l => l.appendChild(row.cloneNode(true)));
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
    const lists = [
        document.getElementById('transactions-list'),
        document.getElementById('transactions-page-list')
    ].filter(Boolean);
    if (lists.length === 0) return;
    try {
        const data = await api('/transactions');
        lists.forEach(l => l.innerHTML = '');
        if (data.length === 0) {
            lists.forEach(l => l.textContent = 'No transactions');
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
            lists.forEach(l => l.appendChild(row.cloneNode(true)));
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

async function submitTransactionForm() {
    const id = document.getElementById('transaction-id').value;
    if (id) {
        await api(`/transactions/${id}`, {method: 'PUT', body: JSON.stringify({
            description: document.getElementById('transaction-desc').value.trim(),
            amount: parseFloat(document.getElementById('transaction-amount').value),
            date: document.getElementById('transaction-date').value,
            category_id: parseInt(document.getElementById('transaction-category').value)
        })});
    } else {
        await createTransaction();
    }
    closeModal('transaction-modal');
    document.getElementById('transaction-id').value = '';
    document.getElementById('transaction-desc').value = '';
    document.getElementById('transaction-amount').value = '';
    loadTransactions();
}

async function editTransaction(id) {
    const t = await api(`/transactions/${id}`);
    document.getElementById('transaction-id').value = t.id;
    document.getElementById('transaction-desc').value = t.description;
    document.getElementById('transaction-amount').value = t.amount;
    document.getElementById('transaction-date').value = t.date;
    document.getElementById('transaction-category').value = t.category_id;
    openModal('transaction-modal');
}

async function deleteTransaction(id) {
    if (!confirm('Delete transaction?')) return;
    await api(`/transactions/${id}`, {method: 'DELETE'});
    loadTransactions();
}

// Budgets
async function loadBudgets() {
    const lists = [
        document.getElementById('budgets-list')
    ].filter(Boolean);
    if (lists.length === 0) return;
    try {
        const data = await api('/budgets');
        lists.forEach(l => l.innerHTML = '');
        if (data.length === 0) {
            lists.forEach(l => l.textContent = 'No budgets');
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
            lists.forEach(l => l.appendChild(row.cloneNode(true)));
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

async function submitBudgetForm() {
    const id = document.getElementById('budget-id').value;
    const name = document.getElementById('budget-name').value.trim();
    const amount = parseFloat(document.getElementById('budget-amount').value);
    const start = document.getElementById('budget-start').value;
    const end = document.getElementById('budget-end').value;
    if (!name || isNaN(amount) || !start) return;
    const payload = {name, amount, start_date: start, end_date: end};
    if (id) {
        await api(`/budgets/${id}`, {method: 'PUT', body: JSON.stringify(payload)});
    } else {
        await api('/budgets', {method: 'POST', body: JSON.stringify(payload)});
    }
    closeModal('budget-modal');
    document.getElementById('budget-id').value = '';
    document.getElementById('budget-name').value = '';
    document.getElementById('budget-amount').value = '';
    loadBudgets();
}

async function editBudget(id) {
    const b = await api(`/budgets/${id}`);
    document.getElementById('budget-id').value = b.id;
    document.getElementById('budget-name').value = b.name;
    document.getElementById('budget-amount').value = b.amount;
    document.getElementById('budget-start').value = b.start_date;
    document.getElementById('budget-end').value = b.end_date || '';
    openModal('budget-modal');
}

async function deleteBudget(id) {
    if (!confirm('Delete budget?')) return;
    await api(`/budgets/${id}`, {method: 'DELETE'});
    loadBudgets();
}

// Recurring items
async function loadRecurringItems() {
    const lists = [
        document.getElementById('recurring-list'),
        document.getElementById('recurring-page-list')
    ].filter(Boolean);
    if (lists.length === 0) return;
    try {
        const data = await api('/recurring_items');
        lists.forEach(l => l.innerHTML = '');
        if (data.length === 0) {
            lists.forEach(l => l.textContent = 'No recurring items');
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
            lists.forEach(l => l.appendChild(row.cloneNode(true)));
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

async function submitRecurringForm() {
    const id = document.getElementById('recurring-id').value;
    const name = document.getElementById('recurring-name').value.trim();
    const amount = parseFloat(document.getElementById('recurring-amount').value);
    const frequency = document.getElementById('recurring-frequency').value.trim();
    const next = document.getElementById('recurring-next').value;
    if (!name || isNaN(amount) || !frequency || !next) return;
    const payload = {name, amount, frequency, next_due_date: next};
    if (id) {
        await api(`/recurring_items/${id}`, {method: 'PUT', body: JSON.stringify(payload)});
    } else {
        await api('/recurring_items', {method: 'POST', body: JSON.stringify(payload)});
    }
    closeModal('recurring-modal');
    document.getElementById('recurring-id').value = '';
    document.getElementById('recurring-name').value = '';
    document.getElementById('recurring-amount').value = '';
    loadRecurringItems();
}

async function editRecurring(id) {
    const r = await api(`/recurring_items/${id}`);
    document.getElementById('recurring-id').value = r.id;
    document.getElementById('recurring-name').value = r.name;
    document.getElementById('recurring-amount').value = r.amount;
    document.getElementById('recurring-frequency').value = r.frequency;
    document.getElementById('recurring-next').value = r.next_due_date;
    openModal('recurring-modal');
}

async function deleteRecurring(id) {
    if (!confirm('Delete recurring item?')) return;
    await api(`/recurring_items/${id}`, {method: 'DELETE'});
    loadRecurringItems();
}

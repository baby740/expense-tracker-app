const API_URL = 'http://localhost:8080/api/transactions';

const form = document.getElementById('transaction-form');
const textInput = document.getElementById('text');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const listBody = document.getElementById('transaction-list-body');

const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const netBalanceEl = document.getElementById('net-balance');

let myChart; // Chart instance container handler object

// 1. Fetch Records from Active Engine API Router
async function getTransactions() {
    try {
        const res = await fetch(API_URL);
        const json = await res.json();
        const transactions = json.data || [];
        updateDOM(transactions);
        updateChart(transactions);
    } catch (err) {
        console.error("Connectivity pipeline broke down:", err);
    }
}

// 2. Render Layout Tables View & Compute Balance Values
function updateDOM(transactions) {
    listBody.innerHTML = '';
    
    let income = 0;
    let expense = 0;

    if(transactions.length === 0) {
        listBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No database records found</td></tr>`;
    }

    transactions.forEach(t => {
        const valueAmount = Number(t.amount);
        const isExpense = valueAmount < 0;
        
        if (!isExpense) income += valueAmount;
        else expense += Math.abs(valueAmount);

        const tr = document.createElement('tr');
        tr.className = isExpense ? 'table-danger-subtle' : 'table-success-subtle';
        
        tr.innerHTML = `
            <td><strong class="text-dark">${t.title || 'Data Entry'}</strong></td>
            <td><span class="badge bg-secondary">${t.category}</span></td>
            <td class="text-end fw-bold ${isExpense ? 'text-danger' : 'text-success'}">
                ${isExpense ? '-' : '+'}₹${Math.abs(valueAmount).toFixed(2)}
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-dark border-0 fw-bold" onclick="deleteTransaction('${t._id}')">✕</button>
            </td>
        `;
        listBody.appendChild(tr);
    });

    totalIncomeEl.innerText = `₹${income.toFixed(2)}`;
    totalExpenseEl.innerText = `₹${expense.toFixed(2)}`;
    netBalanceEl.innerText = `₹${(income - expense).toFixed(2)}`;
}

// 3. Add Entry Object Interceptor Trigger 
async function addTransaction(e) {
    e.preventDefault();

    const data = {
        title: textInput.value,
        amount: Number(amountInput.value),
        category: categoryInput.value
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        textInput.value = '';
        amountInput.value = '';
        getTransactions();
    } catch (err) {
        console.error("Insertion action intercept failed:", err);
    }
}

// 4. Delete Data Core Process API Request Trigger
async function deleteTransaction(id) {
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        getTransactions();
    } catch (err) {
        console.error("Deletion cycle block failed:", err);
    }
}

// 5. Dynamic Chart JS Interface Integration
function updateChart(transactions) {
    const categories = ['Salary/Job', 'Food', 'Rent', 'Entertainment', 'Others'];
    const totals = [0, 0, 0, 0, 0];

    transactions.forEach(t => {
        const idx = categories.indexOf(t.category);
        if (idx !== -1) totals[idx] += Math.abs(Number(t.amount));
    });

    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    if (myChart) myChart.destroy(); // Clear existing layout memory footprints

    myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: totals,
                backgroundColor: ['#198754', '#ff6384', '#36a2eb', '#cc65fe', '#ffce56']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

form.addEventListener('submit', addTransaction);
window.addEventListener('DOMContentLoaded', getTransactions);
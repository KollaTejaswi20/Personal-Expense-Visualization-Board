const CATEGORY_CONFIG = {
  food: {
    id: 'food',
    name: 'Food & Dining',
    icon: '🍔',
    color: '#f97316',
    cssClass: 'food'
  },
  travel: {
    id: 'travel',
    name: 'Travel & Commute',
    icon: '✈️',
    color: '#0284c7',
    cssClass: 'travel'
  },
  education: {
    id: 'education',
    name: 'Education & Books',
    icon: '📚',
    color: '#10b981',
    cssClass: 'education'
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment & Leisure',
    icon: '🎬',
    color: '#8b5cf6',
    cssClass: 'entertainment'
  }
};

const STORAGE_KEY = 'personal_expenses_data_v1';


function getPastDateString(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// Initial realistic sample data for demonstration
const SAMPLE_EXPENSES = [
  {
    id: 'exp_1',
    title: 'University Textbook & Notebooks',
    amount: 1450.00,
    category: 'education',
    date: getPastDateString(1),
    payment: 'UPI / Online',
    notes: 'Algorithms & Data Structures books'
  },
  {
    id: 'exp_2',
    title: 'Monthly Metro Rail Pass',
    amount: 900.00,
    category: 'travel',
    date: getPastDateString(3),
    payment: 'Card',
    notes: 'Commute to campus'
  },
  {
    id: 'exp_3',
    title: 'Campus Cafeteria Lunch',
    amount: 180.00,
    category: 'food',
    date: getPastDateString(0),
    payment: 'UPI / Online',
    notes: 'Lunch with study group'
  },
  {
    id: 'exp_4',
    title: 'Movie Tickets & Popcorn',
    amount: 650.00,
    category: 'entertainment',
    date: getPastDateString(2),
    payment: 'Card',
    notes: 'Weekend weekend cinema'
  },
  {
    id: 'exp_5',
    title: 'Online Coding Course Subscription',
    amount: 1200.00,
    category: 'education',
    date: getPastDateString(5),
    payment: 'Net Banking',
    notes: 'Web development certification'
  },
  {
    id: 'exp_6',
    title: 'Weekly Grocery Essentials',
    amount: 820.00,
    category: 'food',
    date: getPastDateString(4),
    payment: 'UPI / Online',
    notes: 'Fruits, milk, bread'
  },
  {
    id: 'exp_7',
    title: 'Auto Rickshaw to Exam Hall',
    amount: 120.00,
    category: 'travel',
    date: getPastDateString(2),
    payment: 'Cash',
    notes: 'Quick ride'
  },
  {
    id: 'exp_8',
    title: 'Music Streaming Subscription',
    amount: 199.00,
    category: 'entertainment',
    date: getPastDateString(6),
    payment: 'Card',
    notes: 'Monthly renewal'
  }
];

// ============================================================================
// 2. STATE MANAGEMENT (Concept: State)
// ============================================================================
/**
 * Single Source of Truth for the entire application.
 * All UI views reflect this central state.
 */
let state = {
  expenses: loadExpensesFromStorage(),
  filterCategory: 'all',     // 'all' | 'food' | 'travel' | 'education' | 'entertainment'
  searchQuery: '',           // Filter by title or notes
  sortBy: 'date-desc'        // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'
};

/**
 * Loads saved state from browser localStorage or loads sample data on first run.
 * @returns {Array} Array of expense objects
 */
function loadExpensesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[State] Error parsing localStorage data, using defaults.', err);
  }
  // If first time visiting, seed with realistic sample data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_EXPENSES));
  return [...SAMPLE_EXPENSES];
}

/**
 * Saves current expenses array to localStorage.
 */
function saveExpensesToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.expenses));
  } catch (err) {
    console.error('[State] Failed to save expenses to localStorage.', err);
  }
}

// ============================================================================
// 3. DERIVED DATA & ARRAY METHODS (Concepts: Derived Data & Array Methods)
// ============================================================================
/**
 * Derived Data is NEVER stored directly in state. Instead, it is computed dynamically
 * whenever state.expenses changes. This guarantees zero state-synchronization bugs.
 */

/**
 * Concept: Array.prototype.reduce()
 * Computes the grand total sum of all expenses.
 * @param {Array} expenseList
 * @returns {number}
 */
function computeTotalAmount(expenseList) {
  const total = expenseList.reduce((accumulator, item) => accumulator + Number(item.amount), 0);
  console.log(`[Array Method: .reduce()] Grand Total computed: ₹${total.toFixed(2)} across ${expenseList.length} items.`);
  return total;
}

/**
 * Concept: Array.prototype.reduce() & Array.prototype.filter()
 * Aggregates statistics specifically for the 4 categories: food, travel, education, entertainment.
 * @param {Array} expenseList
 * @param {number} grandTotal
 * @returns {Object} Object keyed by category with amount, percentage, count
 */
function computeCategoryBreakdown(expenseList, grandTotal) {
  const categories = Object.keys(CATEGORY_CONFIG); // ['food', 'travel', 'education', 'entertainment']

  // Map each category to its aggregated metrics
  const breakdown = {};

  categories.forEach(catKey => {
    // Concept: .filter() - isolates transactions belonging to one category
    const catItems = expenseList.filter(item => item.category === catKey);

    // Concept: .reduce() - calculates category subtotal
    const catTotal = catItems.reduce((acc, curr) => acc + Number(curr.amount), 0);

    // Concept: Derived calculation for percentage share
    const percentage = grandTotal > 0 ? (catTotal / grandTotal) * 100 : 0;

    breakdown[catKey] = {
      config: CATEGORY_CONFIG[catKey],
      amount: catTotal,
      percentage: percentage,
      count: catItems.length
    };
  });

  return breakdown;
}

/**
 * Concept: Array.prototype.reduce() / Math.max
 * Derives the highest spending category based on computed subtotals.
 * @param {Object} categoryBreakdown
 * @returns {Object|null}
 */
function deriveTopCategory(categoryBreakdown) {
  let topCat = null;
  let maxAmount = 0;

  Object.values(categoryBreakdown).forEach(item => {
    if (item.amount > maxAmount) {
      maxAmount = item.amount;
      topCat = item;
    }
  });

  return topCat;
}

/**
 * Concept: Array.prototype.reduce()
 * Finds the single transaction with the highest expenditure.
 * @param {Array} expenseList
 * @returns {Object|null}
 */
function deriveHighestSingleExpense(expenseList) {
  if (expenseList.length === 0) return null;

  return expenseList.reduce((maxItem, currentItem) => {
    return Number(currentItem.amount) > Number(maxItem.amount) ? currentItem : maxItem;
  }, expenseList[0]);
}

/**
 * Concept: Derived Average
 * Computes average expense per transaction.
 * @param {number} total
 * @param {number} count
 * @returns {number}
 */
function deriveAverageExpense(total, count) {
  if (count === 0) return 0;
  return total / count;
}

/**
 * Concept: Array.prototype.filter() and Array.prototype.sort()
 * Filters and sorts expenses for the transaction list view without mutating original state.
 * @returns {Array} Processed array ready for display
 */
function getFilteredAndSortedExpenses() {
  let result = [...state.expenses];

  // 1. Filter by Category using .filter()
  if (state.filterCategory !== 'all') {
    result = result.filter(item => item.category === state.filterCategory);
  }

  // 2. Filter by Search Query using .filter()
  if (state.searchQuery.trim() !== '') {
    const q = state.searchQuery.toLowerCase().trim();
    result = result.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchNotes = item.notes ? item.notes.toLowerCase().includes(q) : false;
      const matchCategory = item.category.toLowerCase().includes(q);
      return matchTitle || matchNotes || matchCategory;
    });
  }

  // 3. Sort using .sort()
  result.sort((a, b) => {
    switch (state.sortBy) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'amount-desc':
        return Number(b.amount) - Number(a.amount);
      case 'amount-asc':
        return Number(a.amount) - Number(b.amount);
      default:
        return 0;
    }
  });

  return result;
}

// ============================================================================
// 4. REUSABLE CARD GENERATORS (Concept: Reusable Cards)
// ============================================================================

/**
 * Factory function for Category Overview Cards.
 * Takes a pure data object and returns consistent HTML markup.
 * @param {Object} data - Category breakdown info
 * @returns {string} HTML string
 */
function createCategoryCard(data) {
  const { config, amount, percentage, count } = data;
  return `
    <div class="category-summary-card category-card-${config.id}" data-category="${config.id}">
      <div class="cat-card-top">
        <div class="cat-card-title-group">
          <span class="cat-emoji" aria-hidden="true">${config.icon}</span>
          <span class="cat-name">${config.name}</span>
        </div>
        <span class="cat-percentage-pill">${percentage.toFixed(1)}%</span>
      </div>
      <div class="cat-card-amount">₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      <div class="cat-card-footer">
        <span>${count} ${count === 1 ? 'transaction' : 'transactions'}</span>
        <span>${percentage > 0 ? (percentage >= 40 ? '⚠️ High Share' : 'Normal') : 'No spend'}</span>
      </div>
    </div>
  `;
}

/**
 * Factory function for Individual Expense Transaction Cards.
 * Demonstrates reusable modular templating with dynamic badges and delete actions.
 * @param {Object} expense - Single expense item
 * @returns {string} HTML string
 */
function createExpenseCard(expense) {
  const config = CATEGORY_CONFIG[expense.category] || {
    name: expense.category,
    icon: '💸',
    color: '#64748b'
  };

  const formattedDate = formatDateDisplay(expense.date);
  const formattedAmount = Number(expense.amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `
    <div class="expense-item-card" data-id="${expense.id}">
      <div class="item-left">
        <div class="item-cat-icon cat-icon-${expense.category}" title="${config.name}">
          ${config.icon}
        </div>
        <div class="item-details">
          <div class="item-title-row">
            <span class="item-title" title="${escapeHtml(expense.title)}">${escapeHtml(expense.title)}</span>
            <span class="item-badge item-badge-${expense.category}">${expense.category}</span>
          </div>
          <div class="item-sub-meta">
            <span>📅 ${formattedDate}</span>
            <span>💳 ${escapeHtml(expense.payment || 'UPI')}</span>
            ${expense.notes ? `<span>📝 ${escapeHtml(expense.notes)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="item-right">
        <span class="item-amount">₹${formattedAmount}</span>
        <button 
          class="btn-delete-item" 
          onclick="handleDeleteExpense('${expense.id}')" 
          title="Delete expense"
          aria-label="Delete expense: ${escapeHtml(expense.title)}"
        >
          🗑️
        </button>
      </div>
    </div>
  `;
}

// ============================================================================
// 5. VISUAL RENDERING (Concept: Visual Summaries & Charts)
// ============================================================================

/**
 * Renders the pure SVG Donut Chart dynamically without any external library.
 * Mathematics: Circumference = 2 * π * radius.
 * Each category gets an SVG circle slice using stroke-dasharray and stroke-dashoffset.
 * @param {Object} categoryBreakdown
 * @param {number} grandTotal
 */
function renderDonutChart(categoryBreakdown, grandTotal) {
  const svg = document.getElementById('donut-chart');
  const centerAmountEl = document.getElementById('chart-center-total');
  
  centerAmountEl.textContent = `₹${Math.round(grandTotal).toLocaleString('en-IN')}`;

  // Keep the background circle
  svg.innerHTML = '<circle class="donut-bg" cx="50" cy="50" r="38" />';

  if (grandTotal <= 0) {
    return;
  }

  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76

  let cumulativePercent = 0;

  Object.values(categoryBreakdown).forEach(item => {
    if (item.amount <= 0) return;

    const slicePercent = item.percentage;
    const strokeDasharrayLength = (slicePercent / 100) * circumference;
    const strokeDashoffset = - (cumulativePercent / 100) * circumference;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'donut-segment');
    circle.setAttribute('cx', '50');
    circle.setAttribute('cy', '50');
    circle.setAttribute('r', radius.toString());
    circle.setAttribute('stroke', item.config.color);
    circle.setAttribute('stroke-dasharray', `${strokeDasharrayLength} ${circumference - strokeDasharrayLength}`);
    circle.setAttribute('stroke-dashoffset', strokeDashoffset.toString());
    
    // Accessibility / Tooltip
    circle.innerHTML = `<title>${item.config.name}: ₹${item.amount.toFixed(2)} (${slicePercent.toFixed(1)}%)</title>`;

    svg.appendChild(circle);
    cumulativePercent += slicePercent;
  });
}

/**
 * Renders percentage progress bars for Food, Travel, Education, Entertainment.
 * @param {Object} categoryBreakdown
 */
function renderCategoryProgressBars(categoryBreakdown) {
  const container = document.getElementById('category-progress-bars');
  
  // Concept: Array.prototype.map() - transform category objects into progress HTML
  const html = Object.values(categoryBreakdown).map(item => {
    const formattedAmount = item.amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const pct = item.percentage.toFixed(1);

    return `
      <div class="progress-item">
        <div class="progress-header">
          <span class="progress-cat-label">
            <span>${item.config.icon}</span>
            <span>${item.config.name}</span>
          </span>
          <span class="progress-metrics">
            <strong>₹${formattedAmount}</strong> (${pct}%)
          </span>
        </div>
        <div class="progress-track" title="${item.config.name}: ${pct}% of total">
          <div 
            class="progress-fill fill-${item.config.id}" 
            style="width: ${item.percentage}%;"
          ></div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

/**
 * Orchestrates full UI rendering across all dashboard sections.
 */
function renderDashboard() {
  console.log('[Render] Refreshing dashboard with latest state...');

  // 1. Calculate Derived Data
  const grandTotal = computeTotalAmount(state.expenses);
  const totalCount = state.expenses.length;
  const categoryBreakdown = computeCategoryBreakdown(state.expenses, grandTotal);
  const topCategory = deriveTopCategory(categoryBreakdown);
  const highestExpense = deriveHighestSingleExpense(state.expenses);
  const averageExpense = deriveAverageExpense(grandTotal, totalCount);

  // 2. Render Top KPI Metrics Cards
  document.getElementById('kpi-total-amount').textContent = `₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('kpi-total-count').textContent = `${totalCount} ${totalCount === 1 ? 'transaction' : 'transactions'}`;
  
  if (topCategory && topCategory.amount > 0) {
    document.getElementById('kpi-top-category').textContent = `${topCategory.config.icon} ${topCategory.config.name.split(' ')[0]}`;
    document.getElementById('kpi-top-category-amount').textContent = `₹${topCategory.amount.toFixed(2)} (${topCategory.percentage.toFixed(1)}%)`;
  } else {
    document.getElementById('kpi-top-category').textContent = 'None';
    document.getElementById('kpi-top-category-amount').textContent = '₹0.00 spent';
  }

  document.getElementById('kpi-avg-amount').textContent = `₹${averageExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (highestExpense) {
    document.getElementById('kpi-max-amount').textContent = `₹${Number(highestExpense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById('kpi-max-title').textContent = highestExpense.title;
  } else {
    document.getElementById('kpi-max-amount').textContent = '₹0.00';
    document.getElementById('kpi-max-title').textContent = 'None';
  }

  // 3. Render 4 Category Overview Cards (Food, Travel, Education, Entertainment)
  const categoryCardsContainer = document.getElementById('category-cards-container');
  // Concept: Array.prototype.map() - reusable card components
  categoryCardsContainer.innerHTML = Object.values(categoryBreakdown)
    .map(data => createCategoryCard(data))
    .join('');

  // 4. Render Visual Summaries (SVG Chart + Progress Bars)
  renderDonutChart(categoryBreakdown, grandTotal);
  renderCategoryProgressBars(categoryBreakdown);

  // 5. Render Filtered & Sorted Transaction Records
  renderExpenseList();
}

/**
 * Renders the list of transactions applying active filters, search, and sorting.
 */
function renderExpenseList() {
  const container = document.getElementById('expense-list-container');
  const countText = document.getElementById('transactions-count-text');
  const filterIndicator = document.getElementById('filter-indicator');

  const visibleExpenses = getFilteredAndSortedExpenses();
  countText.textContent = `Showing ${visibleExpenses.length} of ${state.expenses.length} records`;

  // Toggle filter banner
  const isFiltered = state.filterCategory !== 'all' || state.searchQuery.trim() !== '';
  if (isFiltered) {
    filterIndicator.style.display = 'flex';
  } else {
    filterIndicator.style.display = 'none';
  }

  if (visibleExpenses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h4>No expenses found</h4>
        <p>${state.expenses.length === 0 ? 'Start by adding your first daily expense using the form on the left!' : 'No expenses match the current filter or search criteria.'}</p>
      </div>
    `;
    return;
  }

  // Concept: .map() generating reusable cards
  container.innerHTML = visibleExpenses.map(expense => createExpenseCard(expense)).join('');
}

// ============================================================================
// 6. FORM HANDLING & VALIDATION (Concept: Forms)
// ============================================================================

/**
 * Initializes form submission, validation, and control actions.
 */
function setupFormHandling() {
  const form = document.getElementById('expense-form');
  const dateInput = document.getElementById('expense-date');
  const resetBtn = document.getElementById('btn-reset-form');

  // Set default date to today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
  dateInput.max = today; // Prevent future dates for daily expenses

  // Display today's human-readable date in header badge
  document.getElementById('current-date-badge').textContent = `Today: ${new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })}`;

  // Form Submit Event Handler
  form.addEventListener('submit', function (event) {
    // Crucial Concept: e.preventDefault() prevents browser page refresh
    event.preventDefault();

    const titleEl = document.getElementById('expense-title');
    const amountEl = document.getElementById('expense-amount');
    const categoryEl = document.getElementById('expense-category');
    const paymentEl = document.getElementById('expense-payment');
    const notesEl = document.getElementById('expense-notes');

    const title = titleEl.value.trim();
    const amount = parseFloat(amountEl.value);
    const category = categoryEl.value;
    const date = dateInput.value;
    const payment = paymentEl.value;
    const notes = notesEl.value.trim();

    // Validate inputs
    let isValid = true;
    clearFormErrors();

    if (!title) {
      showFieldError('title', 'Please enter a description or title.');
      isValid = false;
    } else if (title.length < 2) {
      showFieldError('title', 'Title must be at least 2 characters.');
      isValid = false;
    }

    if (isNaN(amount) || amount <= 0) {
      showFieldError('amount', 'Enter a valid amount greater than ₹0.');
      isValid = false;
    }

    if (!category) {
      showFieldError('category', 'Please select one category.');
      isValid = false;
    }

    if (!date) {
      showFieldError('date', 'Please pick a valid date.');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    // Create new expense object
    const newExpense = {
      id: 'exp_' + Date.now(),
      title: title,
      amount: Number(amount.toFixed(2)),
      category: category,
      date: date,
      payment: payment,
      notes: notes
    };

    // Update State (Concept: State Mutation & Immutability)
    state.expenses = [newExpense, ...state.expenses];

    // Persist to LocalStorage
    saveExpensesToStorage();

    // Re-render full dashboard to update Derived Data & Cards
    renderDashboard();

    // User Feedback
    showToast(`Added: ₹${newExpense.amount.toFixed(2)} to ${CATEGORY_CONFIG[newExpense.category].name}`, 'success');

    // Cleanly Reset Form
    form.reset();
    dateInput.value = today;
    document.getElementById('expense-payment').value = 'UPI / Online';
    titleEl.focus();
  });

  // Manual Reset Button
  resetBtn.addEventListener('click', function () {
    clearFormErrors();
    form.reset();
    dateInput.value = today;
  });
}

function showFieldError(fieldId, message) {
  const inputEl = document.getElementById(`expense-${fieldId}`);
  const errorEl = document.getElementById(`error-${fieldId}`);
  if (inputEl) inputEl.classList.add('is-invalid');
  if (errorEl) errorEl.textContent = message;
}

function clearFormErrors() {
  ['title', 'amount', 'category', 'date'].forEach(fieldId => {
    const inputEl = document.getElementById(`expense-${fieldId}`);
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (inputEl) inputEl.classList.remove('is-invalid');
    if (errorEl) errorEl.textContent = '';
  });
}

// ============================================================================
// 7. USER ACTIONS: DELETE, FILTERS & CONTROLS
// ============================================================================

/**
 * Concept: Array.prototype.filter() for deletion
 * Deletes an expense by its unique ID.
 * @param {string} id
 */
window.handleDeleteExpense = function (id) {
  // Concept: Array.prototype.find() - locate target before deletion
  const itemToDelete = state.expenses.find(item => item.id === id);
  if (!itemToDelete) return;

  const confirmDelete = confirm(`Are you sure you want to delete "${itemToDelete.title}" (₹${itemToDelete.amount.toFixed(2)})?`);
  if (!confirmDelete) return;

  // Concept: Array.prototype.filter() - creates new array excluding deleted id
  state.expenses = state.expenses.filter(item => item.id !== id);

  // Save updated state and re-render
  saveExpensesToStorage();
  renderDashboard();

  showToast(`Deleted "${itemToDelete.title}"`, 'danger');
};

/**
 * Sets up filters, search bar, sort select, and faculty guide toggle.
 */
function setupFilterAndControls() {
  const searchInput = document.getElementById('search-input');
  const filterSelect = document.getElementById('filter-category-select');
  const sortSelect = document.getElementById('sort-select');
  const resetFiltersBtn = document.getElementById('btn-reset-filters');

  // Search input handler with debounce
  searchInput.addEventListener('input', function (e) {
    state.searchQuery = e.target.value;
    renderExpenseList();
  });

  // Category filter select handler
  filterSelect.addEventListener('change', function (e) {
    state.filterCategory = e.target.value;
    renderExpenseList();
  });

  // Sort select handler
  sortSelect.addEventListener('change', function (e) {
    state.sortBy = e.target.value;
    renderExpenseList();
  });

  // Reset Filters button
  resetFiltersBtn.addEventListener('click', function () {
    state.filterCategory = 'all';
    state.searchQuery = '';
    filterSelect.value = 'all';
    searchInput.value = '';
    renderExpenseList();
  });

  // Load Sample Data (Demo helper)
  document.getElementById('btn-load-sample').addEventListener('click', function () {
    state.expenses = [...SAMPLE_EXPENSES];
    saveExpensesToStorage();
    renderDashboard();
    showToast('Loaded demo sample expenses!', 'info');
  });

  // Clear All Data
  document.getElementById('btn-clear-all').addEventListener('click', function () {
    if (state.expenses.length === 0) {
      showToast('No expenses to clear.', 'info');
      return;
    }
    const confirmed = confirm('Are you sure you want to clear ALL expenses?');
    if (confirmed) {
      state.expenses = [];
      saveExpensesToStorage();
      renderDashboard();
      showToast('All expense records cleared.', 'danger');
    }
  });

}

// ============================================================================
// 8. UTILITIES & HELPERS
// ============================================================================

/**
 * Returns formatted date string (e.g. "28 Sep, 2026")
 */
function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}


/**
 * Prevents XSS injection when rendering user strings
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Toast notifications for user feedback
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.25s forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 250);
  }, 2800);
}

// ============================================================================
// 9. INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 Initializing Personal Expense Visualization Board...');
  setupFormHandling();
  setupFilterAndControls();
  renderDashboard();
});

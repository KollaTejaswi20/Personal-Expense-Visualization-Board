# 💳 Personal Expense Visualization Board

> A lightweight, modern, and dependency-free frontend dashboard to record daily expenses by category and view real-time totals, dynamic metrics, and visual spending summaries.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📌 About the Project

The **Personal Expense Visualization Board** is a responsive single-page web dashboard built using **100% pure HTML5, CSS3, and Vanilla JavaScript (ES6+)** with **zero external libraries or frameworks**. 

It allows users to log daily expenses across four core categories—**Food & Dining**, **Travel & Commute**, **Education & Books**, and **Entertainment & Leisure**—and immediately view interactive totals, category percentages, pure SVG donut charts, and reusable transaction cards.

---

## ✨ Key Features

- **Dynamic Expense Logging**: Capture title, positive numeric amount, category, date, and payment method with real-time validation and error feedback.
- **Top KPI Metrics (Derived Data)**:
  - Total Spend & Total Transaction Count
  - Highest Spending Category with dynamic share indicator
  - Average Expense per Transaction
  - Highest Single Expense Item
- **Dependency-Free Visual Summaries**:
  - **Pure SVG Donut Chart**: Rendered purely via mathematical stroke offset calculations ($\text{Circumference} = 2\pi r$) without Chart.js or D3.
  - **Animated Progress Bars**: Category-specific progress tracks showing percentage of total spend.
- **Category Overview Cards**: Individual visual cards for Food, Travel, Education, and Entertainment displaying total spent and transaction counts.
- **Interactive Transaction Feed**:
  - Live text search by title or notes
  - Category filter dropdown (`All`, `Food`, `Travel`, `Education`, `Entertainment`)
  - Multi-criteria sorting (Latest, Oldest, Amount: High to Low, Amount: Low to High)
  - One-click deletion with recalculation of all metrics
- **Persistent State**: Automatically syncs state changes to browser `localStorage`.
- **Demo Controls**: Quick buttons to *Load Sample Data* or *Clear All Expenses*.

---

## 🧠 Core Programming Concepts Covered

1. **Forms**: Form event handling, `event.preventDefault()`, input sanitization, dynamic validation styling (`.is-invalid`), and form resets.
2. **State Management**: Central in-memory state object as the single source of truth, synchronized with `localStorage`.
3. **Derived Data**: Calculating totals, averages, category subtotals, and percentages on-the-fly rather than storing redundant state variables.
4. **Array Methods**:
   - `.reduce()`: Grand total calculation and category aggregations.
   - `.filter()`: Category filtering, search querying, and immutable deletion.
   - `.map()`: Generating reusable HTML cards from data arrays.
   - `.sort()`: Multi-criteria date and amount sorting.
   - `.find()`: Identifying specific transactions before deletion.
5. **Reusable Cards (Component Pattern)**: Modular factory functions (`createCategoryCard`, `createExpenseCard`) returning structured HTML using ES6 Template Literals.

---

## 📂 Project Structure

```text
expense-visualization-board/
│
├── index.html        # Semantic HTML5 markup, form layout & visual containers
├── style.css         # Modern CSS3 styling (Grid, Flexbox, CSS Variables, Theme Tokens)
├── app.js            # Pure Vanilla JS logic (State, Forms, Derived Data, Array Methods)
└── README.md         # Project documentation and GitHub guide
```

---

## 🚀 Getting Started

No build step, Node.js, or server installation is required.

1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/expense-visualization-board.git
   ```
2. Navigate to the folder:
   ```bash
   cd expense-visualization-board
   ```
3. Open `index.html` in any web browser:
   - On Windows: Double-click `index.html` or run `start index.html`
   - On Mac: `open index.html`
   - On Linux: `xdg-open index.html`

---

## 📄 License

This project is licensed under the MIT License — feel free to use, modify, and distribute for educational or personal projects.

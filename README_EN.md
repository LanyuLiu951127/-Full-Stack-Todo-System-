# 📝 Full-Stack Todo System

This is a full-stack todo list management system based on **Node.js**, **Express**, and **SQLite**.
The project focuses on implementing a complete **JWT Authentication** mechanism and information security protection, using **Tailwind CSS** to build a modern interface that supports Dark Mode.


## ✨ Highlights

### 🔐 Security
*   **JWT Authentication**: Uses JSON Web Token instead of traditional sessions for stateless API authentication.
*   **Password Encryption**: Uses `bcryptjs` for hashing to ensure passwords are not stored in plain text.
*   **XSS Protection**: Escapes all user input to prevent Cross-Site Scripting attacks.
*   **Access Control**: Strict backend middleware checks to ensure users can only manage their own data.

### 👤 User System
*   **Complete Flow**: Register, Login, Logout.
*   **Forgot Password**: Allows users to reset passwords via "Security Question" verification.
*   **Profile**: Users can change passwords and update security questions.

### ✅ Task Management
*   **CRUD**: Create, Read, Update, Delete tasks.
*   **Multi-attributes**: Supports Due Date, Priority (High/Medium/Low), Category (Work/Life, etc.), and Memo.
*   **Advanced Search**: Supports composite filtering by keyword, priority, and category.

### 🎨 UI/UX
*   **Dark Mode**: Supports one-click toggle for Dark Mode with automatic preference saving.
*   **Responsive**: Fully responsive design adapting to mobile and desktop.

## 🛠️ Tech Stack

*   **Frontend**: HTML5, JavaScript (ES6+), Tailwind CSS
*   **Backend**: Node.js, Express.js
*   **Database**: SQLite3
*   **Auth**: JWT (jsonwebtoken), bcryptjs

## 🚀 Installation

1.  **Clone the project**
    ```bash
    git clone https://github.com/your-username/your-project-name.git
    cd your-project-name
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the server**
    ```bash
    node server.js
    ```

4.  **Open the page**
    Enter `http://localhost:3000` in your browser or open `index.html` directly.

## 📂 Project Structure

```text
├── data.db          # SQLite Database (Auto-generated)
├── index.html       # Frontend Entry
├── server.js        # Backend API & Logic
└── README.md        # Project Documentation
```

## 🔮 Future Improvements

*   [ ] **Data Visualization**: Add charts to analyze task completion rates by category.
*   [ ] **Drag & Drop**: Implement Drag & Drop functionality for reordering tasks.

---
Made with ❤️
# 📝 全端任務管理系統 (Full-Stack Todo System)

這是一個基於 **Node.js**、**Express** 與 **SQLite** 的全端待辦事項管理系統。
專案重點在於實作完整的 **JWT 身分驗證** 機制與資訊安全防護，並採用 **Tailwind CSS** 打造支援深色模式 (Dark Mode) 的現代化介面。



## ✨ 核心亮點 (Highlights)

### 🔐 安全性設計 (Security)
*   **JWT 驗證**：使用 JSON Web Token 取代傳統 Session，實現無狀態 (Stateless) 的 API 驗證。
*   **密碼加密**：採用 `bcryptjs` 進行雜湊加密，確保資料庫不儲存明碼。
*   **XSS 防護**：針對所有使用者輸入內容進行跳脫處理，防止跨站腳本攻擊。
*   **權限控管**：嚴格的後端 Middleware 檢查，確保使用者只能操作屬於自己的資料。

### 👤 會員系統
*   **完整流程**：註冊、登入、登出。
*   **忘記密碼**：透過「安全問題」驗證機制，允許用戶自行重設密碼。
*   **個人中心**：可修改密碼與更新安全問題。

### ✅ 任務管理
*   **CRUD**：新增、讀取、更新、刪除任務。
*   **多屬性**：支援截止日期、優先級 (高/中/低)、類別 (工作/生活等) 與備註。
*   **進階搜尋**：支援關鍵字、優先級與類別的複合篩選。

### 🎨 介面體驗
*   **深色模式**：支援一鍵切換 Dark Mode，並自動記憶設定。
*   **RWD**：完全響應式設計，適配手機與電腦。

## 🛠️ 技術棧 (Tech Stack)

*   **Frontend**: HTML5, JavaScript (ES6+), Tailwind CSS
*   **Backend**: Node.js, Express.js
*   **Database**: SQLite3
*   **Auth**: JWT (jsonwebtoken), bcryptjs

## 🚀 如何執行 (Installation)

1.  **Clone 專案**
    ```bash
    git clone https://github.com/你的帳號/你的專案名稱.git
    cd 你的專案名稱
    ```

2.  **安裝依賴**
    ```bash
    npm install
    ```

3.  **啟動伺服器**
    ```bash
    node server.js
    ```

4.  **開啟網頁**
    在瀏覽器輸入 `http://localhost:3000` 或直接開啟 `index.html`。

## 📂 專案結構

```text
├── data.db          # SQLite 資料庫 (自動生成)
├── index.html       # 前端入口
├── server.js        # 後端 API 與邏輯
└── README.md        # 專案說明
```

---

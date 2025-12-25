const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./data.db');

db.serialize(() => {
    // 建立使用者表
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, security_question TEXT, security_answer TEXT)`);
    // 建立任務表 (新增 user_id 欄位)
    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        user_id INTEGER,
        text TEXT, 
        done INTEGER DEFAULT 0,
        due_date TEXT,
        priority TEXT DEFAULT '中',
        memo TEXT,
        category TEXT DEFAULT '其他'
    )`);
});

// --- JWT 設定與 Middleware ---
const SECRET_KEY = 'your-super-secret-key'; // 實務上應放在環境變數 (.env)

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 格式: "Bearer TOKEN"
    if (!token) return res.status(401).json({ success: false, message: '未提供 Token' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Token 無效或過期' });
        req.user = user; // 將解密後的使用者資訊存入 req.user
        next();
    });
};

// --- 登入/註冊 API ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (!user) return res.json({ success: false, message: "帳號或密碼錯誤" });
        
        // 比對加密密碼
        if (bcrypt.compareSync(password, user.password)) {
            // 登入成功，簽署 Token (有效期限 24 小時)
            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });
            res.json({ success: true, token, user: { id: user.id, username: user.username } });
        } else {
            res.json({ success: false, message: "帳號或密碼錯誤" });
        }
    });
});

app.post('/api/register', (req, res) => {
    const { username, password, question, answer } = req.body;
    if (!username || !password || !question || !answer) return res.json({ success: false, message: "請填寫所有欄位" });

    const hash = bcrypt.hashSync(password, 10); // 密碼加密
    const answerHash = bcrypt.hashSync(answer.toLowerCase(), 10); // 答案加密 (轉小寫以忽略大小寫)

    db.run("INSERT INTO users (username, password, security_question, security_answer) VALUES (?, ?, ?, ?)", 
        [username, hash, question, answerHash], function(err) {
        if (err) res.json({ success: false, message: "帳號已存在" });
        else res.json({ success: true });
    });
});

// --- 忘記密碼相關 API ---
app.post('/api/get-question', (req, res) => {
    const { username } = req.body;
    db.get("SELECT security_question FROM users WHERE username = ?", [username], (err, user) => {
        if (!user) return res.json({ success: false, message: "找不到此帳號" });
        res.json({ success: true, question: user.security_question });
    });
});

app.post('/api/reset-password', (req, res) => {
    const { username, answer, newPassword } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (!user) return res.json({ success: false, message: "帳號不存在" });

        // 驗證安全問題答案 (比對加密雜湊)
        if (bcrypt.compareSync(answer.toLowerCase(), user.security_answer)) {
            const newHash = bcrypt.hashSync(newPassword, 10);
            db.run("UPDATE users SET password = ? WHERE id = ?", [newHash, user.id], (err) => {
                if (err) return res.json({ success: false, message: "更新失敗" });
                res.json({ success: true });
            });
        } else {
            res.json({ success: false, message: "安全問題回答錯誤" });
        }
    });
});

app.post('/api/change-password', authenticateToken, (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // 從 Token 取得 ID
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
        if (!user) return res.json({ success: false, message: "用戶不存在" });

        // 驗證舊密碼是否正確
        if (bcrypt.compareSync(oldPassword, user.password)) {
            const newHash = bcrypt.hashSync(newPassword, 10);
            db.run("UPDATE users SET password = ? WHERE id = ?", [newHash, userId], (err) => {
                if (err) return res.json({ success: false, message: "更新失敗" });
                res.json({ success: true });
            });
        } else {
            res.json({ success: false, message: "舊密碼錯誤" });
        }
    });
});

app.post('/api/change-security-question', authenticateToken, (req, res) => {
    const { password, newQuestion, newAnswer } = req.body;
    const userId = req.user.id; // 從 Token 取得 ID
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
        if (!user) return res.json({ success: false, message: "用戶不存在" });

        // 驗證密碼是否正確
        if (bcrypt.compareSync(password, user.password)) {
            const answerHash = bcrypt.hashSync(newAnswer.toLowerCase(), 10);
            db.run("UPDATE users SET security_question = ?, security_answer = ? WHERE id = ?", 
                [newQuestion, answerHash, userId], (err) => {
                if (err) return res.json({ success: false, message: "更新失敗" });
                res.json({ success: true });
            });
        } else {
            res.json({ success: false, message: "密碼錯誤，無法修改" });
        }
    });
});

// --- 任務 API (現在需要傳入 userId) ---
app.get('/api/todos', authenticateToken, (req, res) => {
    const { q, priority, category } = req.query;
    const userId = req.user.id; // 從 Token 取得 ID
    
    let sql = "SELECT * FROM todos WHERE user_id = ? AND text LIKE ?";
    let params = [userId, `%${q || ''}%`];

    if (priority && priority !== 'all') {
        sql += " AND priority = ?";
        params.push(priority);
    }

    if (category && category !== 'all') {
        sql += " AND category = ?";
        params.push(category);
    }

    sql += " ORDER BY done ASC, id ASC";

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error("資料庫讀取錯誤:", err.message);
            return res.json([]); // 發生錯誤時回傳空陣列，避免前端崩潰
        }
        res.json(rows);
    });
});

app.post('/api/todos', authenticateToken, (req, res) => {
    const { text, due_date, priority, memo, category } = req.body;
    const userId = req.user.id; // 從 Token 取得 ID
    db.run("INSERT INTO todos (user_id, text, due_date, priority, memo, category) VALUES (?, ?, ?, ?, ?, ?)", [userId, text, due_date, priority, memo, category], function(err) {
        if (err) return res.json({ success: false, message: "新增失敗：" + err.message });
        res.json({ success: true });
    });
});

app.put('/api/todos/:id', authenticateToken, (req, res) => {
    const { text, due_date, priority, memo, category } = req.body;
    const userId = req.user.id; // 從 Token 取得 ID
    db.run("UPDATE todos SET text = ?, due_date = ?, priority = ?, memo = ?, category = ? WHERE id = ? AND user_id = ?", 
        [text, due_date, priority, memo, category, req.params.id, userId], function(err) {
        if (err) return res.json({ success: false, message: err.message });
        if (this.changes === 0) return res.json({ success: false, message: "權限不足或任務不存在" });
        res.json({ success: true });
    });
});

app.put('/api/todos/:id/toggle', authenticateToken, (req, res) => {
    const userId = req.user.id; // 從 Token 取得 ID
    db.run("UPDATE todos SET done = 1 - done WHERE id = ? AND user_id = ?", [req.params.id, userId], function(err) {
        if (this.changes === 0) return res.json({ success: false, message: "權限不足或任務不存在" });
        res.json({ success: true });
    });
});

app.delete('/api/todos/:id', authenticateToken, (req, res) => {
    const userId = req.user.id; // 從 Token 取得 ID
    db.run("DELETE FROM todos WHERE id = ? AND user_id = ?", [req.params.id, userId], function(err) {
        if (this.changes === 0) return res.json({ success: false, message: "權限不足或任務不存在" });
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log('✅ 登入版伺服器已啟動: http://localhost:3000'));
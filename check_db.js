const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.db');

console.log('🔍 正在檢查使用者資料庫...');

db.all("SELECT id, username, password FROM users", [], (err, rows) => {
    if (err) return console.error(err.message);
    
    console.log(`\n📊 共有 ${rows.length} 位使用者：\n`);
    rows.forEach(user => {
        console.log(`👤 帳號: ${user.username}`);
        console.log(`🔑 密碼: ${user.password}`);
        console.log('--------------------------------------------------');
    });
    console.log('\n✅ 如果密碼是 $2a$ 開頭的長亂碼，代表加密成功！');
});
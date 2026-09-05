require('dotenv').config(); // Carrega as variáveis do arquivo .env
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit'); // Biblioteca de limite de acessos

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.JWT_SECRET || 'chave_reserva_local';

app.use(cors());
app.use(express.json());

// Configuração do Limite de Tentativas de Login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Tempo de bloqueio: 15 minutos
    max: 5, // Limite de 5 tentativas erradas por IP
    message: { error: 'Muitas tentativas de login. Por segurança, tente novamente em 15 minutos.' }
});

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('Erro ao conectar ao SQLite', err.message);
    else console.log('Conectado ao banco de dados SQLite.');
});

// Criar tabelas necessárias
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    category TEXT,
    content TEXT,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS quote (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    author TEXT
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS hero_banner (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`, () => {
        // Busca usuário e senha do .env (ou usa admin/123 como fallback)
        const defaultUser = process.env.ADMIN_USER || '';
        const defaultPass = process.env.ADMIN_PASS || '';

        // 1. Apaga todos os administradores antigos do banco para não deixar rastros
        db.run(`DELETE FROM admins`, async (err) => {
            // 2. Criptografa a nova senha do .env
            const hashedPassword = await bcrypt.hash(defaultPass, 10);

            // 3. Salva o novo usuário e a nova senha definitivos
            db.run(`INSERT INTO admins (username, password) VALUES (?, ?)`, [defaultUser, hashedPassword]);

            console.log(`Credenciais do painel atualizadas conforme o arquivo .env!`);
        });
    });
});

// Middleware para verificar o token JWT
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Acesso negado.' });

    const bearer = token.split(' ');
    const bearerToken = bearer[1];

    jwt.verify(bearerToken, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
        req.admin = decoded;
        next();
    });
}

// --- ROTAS PÚBLICAS ---
app.get('/api/posts', (req, res) => {
    db.all(`SELECT * FROM posts ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/posts/:id', (req, res) => {
    db.get(`SELECT * FROM posts WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: 'Obra não encontrada.' });
        res.json(row);
    });
});

app.get('/api/quote', (req, res) => {
    db.get(`SELECT * FROM quote ORDER BY id DESC LIMIT 1`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.json({ content: "A arte de viver é simplesmente a arte de saber o que deixar para trás.", author: "Desconhecido" });
        res.json(row);
    });
});

app.get('/api/hero', (req, res) => {
    db.get(`SELECT * FROM hero_banner ORDER BY id DESC LIMIT 1`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.json({ content: "Algumas palavras não precisam ser ditas. Precisam ser sentidas." });
        res.json(row);
    });
});

// --- ROTA DE LOGIN (COM PROTEÇÃO DE FORÇA BRUTA) ---
// Note que inserimos o 'loginLimiter' antes de processar a rota
app.post('/api/login', loginLimiter, (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM admins WHERE username = ?`, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ message: 'Login realizado com sucesso!', token });
    });
});

// --- ROTAS PROTEGIDAS (ADMIN) ---
app.post('/api/posts', verifyToken, (req, res) => {
    const { title, author, category, content, type } = req.body;
    const query = `INSERT INTO posts (title, author, category, content, type) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [title, author, category, content, type], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Obra cadastrada com sucesso!' });
    });
});

app.delete('/api/posts/:id', verifyToken, (req, res) => {
    db.run(`DELETE FROM posts WHERE id = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Obra excluída com sucesso!' });
    });
});

app.post('/api/quote', verifyToken, (req, res) => {
    const { content, author } = req.body;
    db.run(`INSERT INTO quote (content, author) VALUES (?, ?)`, [content, author], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Frase atualizada!' });
    });
});

app.post('/api/hero', verifyToken, (req, res) => {
    const { content } = req.body;
    db.run(`INSERT INTO hero_banner (content) VALUES (?)`, [content], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Banner atualizado com sucesso!' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor seguro rodando na porta ${PORT}`);
});
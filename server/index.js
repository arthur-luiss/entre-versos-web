require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.JWT_SECRET || '';

app.use(cors());
app.use(express.json());

// Conexão com o Supabase (PostgreSQL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Muitas tentativas de login. Por segurança, tente novamente em 15 minutos.' }
});

// Inicialização e criação de tabelas automáticas no PostgreSQL
async function initDb() {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT,
        author TEXT,
        category TEXT,
        content TEXT,
        type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quote (
        id SERIAL PRIMARY KEY,
        content TEXT,
        author TEXT
      );

      CREATE TABLE IF NOT EXISTS hero_banner (
        id SERIAL PRIMARY KEY,
        content TEXT
      );

      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT
      );
    `);

        // Sincroniza o administrador padrão configurado no .env
        const defaultUser = process.env.ADMIN_USER || 'admin';
        const defaultPass = process.env.ADMIN_PASS || '123';

        const adminCheck = await pool.query('SELECT * FROM admins WHERE username = $1', [defaultUser]);
        if (adminCheck.rows.length === 0) {
            const hashedPassword = await bcrypt.hash(defaultPass, 10);
            await pool.query('INSERT INTO admins (username, password) VALUES ($1, $2)', [defaultUser, hashedPassword]);
            console.log('Administrador padrão configurado com sucesso no Supabase.');
        }
        console.log('Conectado ao PostgreSQL (Supabase) com sucesso.');
    } catch (err) {
        console.error('Erro ao inicializar o banco de dados:', err);
    }
}

initDb();

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
app.get('/api/posts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM posts ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/posts/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Obra não encontrada.' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/quote', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM quote ORDER BY id DESC LIMIT 1');
        if (result.rows.length === 0) {
            return res.json({ content: "A arte de viver é simplesmente a arte de saber o que deixar para trás.", author: "Desconhecido" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/hero', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM hero_banner ORDER BY id DESC LIMIT 1');
        if (result.rows.length === 0) {
            return res.json({ content: "Algumas palavras não precisam ser ditas. Precisam ser sentidas." });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ message: 'Login realizado com sucesso!', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ROTAS PROTEGIDAS (ADMIN) ---
app.post('/api/posts', verifyToken, async (req, res) => {
    const { title, author, category, content, type } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO posts (title, author, category, content, type) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [title, author, category, content, type]
        );
        res.json({ id: result.rows[0].id, message: 'Obra cadastrada com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/posts/:id', verifyToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
        res.json({ message: 'Obra excluída com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/quote', verifyToken, async (req, res) => {
    const { content, author } = req.body;
    try {
        await pool.query('INSERT INTO quote (content, author) VALUES ($1, $2)', [content, author]);
        res.json({ message: 'Frase atualizada!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/hero', verifyToken, async (req, res) => {
    const { content } = req.body;
    try {
        await pool.query('INSERT INTO hero_banner (content) VALUES ($1)', [content]);
        res.json({ message: 'Banner atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Atualizar uma obra existente
app.put('/api/posts/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { title, author, category, content, type } = req.body;
    try {
        await pool.query(
            'UPDATE posts SET title = $1, author = $2, category = $3, content = $4, type = $5 WHERE id = $6',
            [title, author, category, content, type, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Erro ao atualizar obra no banco:", err);
        res.status(500).json({ error: "Erro ao atualizar obra" });
    }
});

// --- PRODUÇÃO ---
app.use(express.static(path.join(__dirname, '../dist')));
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
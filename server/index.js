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
const SECRET_KEY = process.env.JWT_SECRET || 'chave-secreta-padrao';

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

      -- Novas tabelas para o ecossistema de leitores
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        UNIQUE(user_id, post_id)
      );

      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
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

// Middleware: Verifica Token do Administrador
function verifyAdminToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Acesso negado.' });

    const bearerToken = token.split(' ')[1];
    jwt.verify(bearerToken, SECRET_KEY, (err, decoded) => {
        if (err || decoded.role !== 'admin') return res.status(403).json({ error: 'Token de administrador inválido ou expirado.' });
        req.admin = decoded;
        next();
    });
}

// Middleware: Verifica Token do Leitor (Usuário Público)
function verifyUserToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Acesso negado. Faça login para continuar.' });

    const bearerToken = token.split(' ')[1];
    jwt.verify(bearerToken, SECRET_KEY, (err, decoded) => {
        if (err || decoded.role !== 'user') return res.status(403).json({ error: 'Sessão expirada. Faça login novamente.' });
        req.user = decoded; // Salva os dados do leitor na requisição
        next();
    });
}


// ==========================================
// ROTAS PÚBLICAS ORIGINAIS (Acervo e Textos)
// ==========================================

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

// Login do Administrador
app.post('/api/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });

        const token = jwt.sign({ id: user.id, username: user.username, role: 'admin' }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ message: 'Login realizado com sucesso!', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// ROTAS DE AUTENTICAÇÃO PÚBLICA (Leitores)
// ==========================================

app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) return res.status(400).json({ error: 'Este e-mail já está em uso.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'Conta criada com sucesso!', user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

        const token = jwt.sign({ id: user.id, name: user.name, role: 'user' }, SECRET_KEY, { expiresIn: '7d' });

        res.json({
            message: 'Login bem-sucedido!',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// ROTAS DO PERFIL DO LEITOR (Histórico)
// ==========================================

// Buscar todas as obras curtidas pelo leitor
app.get('/api/user/likes', verifyUserToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(`
            SELECT p.id, p.title, p.author, p.category, l.created_at as liked_at
            FROM posts p
            JOIN likes l ON p.id = l.post_id
            WHERE l.user_id = $1
            ORDER BY l.created_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar todos os comentários feitos pelo leitor
app.get('/api/user/comments', verifyUserToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(`
            SELECT c.id, c.content, c.created_at, p.id as post_id, p.title as post_title
            FROM comments c
            JOIN posts p ON c.post_id = p.id
            WHERE c.user_id = $1
            ORDER BY c.created_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Atualizar os dados do leitor (Nome ou Email)
app.put('/api/user/profile', verifyUserToken, async (req, res) => {
    const userId = req.user.id;
    const { name, email } = req.body;
    try {
        // Verifica se o novo e-mail já pertence a outra pessoa
        const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
        if (emailCheck.rows.length > 0) return res.status(400).json({ error: 'Este e-mail já está em uso por outra conta.' });

        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
            [name, email, userId]
        );
        res.json({ message: 'Perfil atualizado com sucesso!', user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Alterar a senha do leitor (não exige a senha atual, apenas a nova)
app.put('/api/user/password', verifyUserToken, async (req, res) => {
    const userId = req.user.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);
        res.json({ message: 'Senha alterada com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// ROTAS DE INTERAÇÃO (Curtidas e Comentários)
// ==========================================

app.get('/api/posts/:id/likes', async (req, res) => {
    const postId = req.params.id;
    const userId = req.query.userId;

    try {
        const totalResult = await pool.query('SELECT COUNT(*) FROM likes WHERE post_id = $1', [postId]);
        let userLiked = false;

        if (userId) {
            const userLikeResult = await pool.query('SELECT id FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
            userLiked = userLikeResult.rows.length > 0;
        }

        res.json({ total: parseInt(totalResult.rows[0].count), userLiked });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/posts/:id/like', verifyUserToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        const existingLike = await pool.query('SELECT id FROM likes WHERE user_id = $1 AND post_id = $2', [userId, postId]);

        if (existingLike.rows.length > 0) {
            await pool.query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
            return res.json({ message: 'Curtida removida', action: 'unliked' });
        } else {
            await pool.query('INSERT INTO likes (user_id, post_id) VALUES ($1, $2)', [userId, postId]);
            return res.json({ message: 'Obra curtida', action: 'liked' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/posts/:id/comments', async (req, res) => {
    const postId = req.params.id;
    try {
        const result = await pool.query(`
            SELECT c.id, c.content, c.created_at, c.user_id, u.name as author_name 
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.post_id = $1 
            ORDER BY c.created_at DESC
        `, [postId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/posts/:id/comments', verifyUserToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'O comentário não pode ser vazio.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *',
            [userId, postId, content]
        );
        res.status(201).json({ message: 'Comentário publicado!', comment: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/comments/:id', verifyUserToken, async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user.id;

    try {
        const comment = await pool.query('SELECT user_id FROM comments WHERE id = $1', [commentId]);

        if (comment.rows.length === 0) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }

        if (comment.rows[0].user_id !== userId) {
            return res.status(403).json({ error: 'Você não tem permissão para apagar este comentário.' });
        }

        await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
        res.json({ message: 'Comentário apagado com sucesso.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// ROTAS PROTEGIDAS (Painel do Administrador)
// ==========================================

app.post('/api/posts', verifyAdminToken, async (req, res) => {
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

app.delete('/api/posts/:id', verifyAdminToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
        res.json({ message: 'Obra excluída com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/quote', verifyAdminToken, async (req, res) => {
    const { content, author } = req.body;
    try {
        await pool.query('INSERT INTO quote (content, author) VALUES ($1, $2)', [content, author]);
        res.json({ message: 'Frase atualizada!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/hero', verifyAdminToken, async (req, res) => {
    const { content } = req.body;
    try {
        await pool.query('INSERT INTO hero_banner (content) VALUES ($1)', [content]);
        res.json({ message: 'Banner atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/posts/:id', verifyAdminToken, async (req, res) => {
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

// Lista todos os comentários do site, com autor e obra, para moderação
app.get('/api/admin/comments', verifyAdminToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.id, c.content, c.created_at, c.user_id, u.name as author_name, p.id as post_id, p.title as post_title
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN posts p ON c.post_id = p.id
            ORDER BY c.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Exclui qualquer comentário do site (moderação, sem restrição de autoria)
app.delete('/api/admin/comments/:id', verifyAdminToken, async (req, res) => {
    const commentId = req.params.id;
    try {
        const result = await pool.query('DELETE FROM comments WHERE id = $1 RETURNING id', [commentId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }
        res.json({ message: 'Comentário removido pela moderação.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// CONFIGURAÇÃO DE PRODUÇÃO E SERVERLESS
// ==========================================

app.use(express.static(path.join(__dirname, '../dist')));
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const serverless = require('serverless-http');

// Se NÃO estiver na Vercel, liga o servidor normal (Localhost)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

// Exporta para a Vercel (Serverless)
module.exports = app;
module.exports.handler = serverless(app);
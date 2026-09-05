const API_URL = ''; // Deixar vazio faz a aplicação usar rotas relativas (/api) tanto no proxy local quanto no Express em produção

export async function getPosts() {
  const res = await fetch(`${API_URL}/api/posts`);
  return res.json();
}

export async function getQuote() {
  const res = await fetch(`${API_URL}/api/quote`);
  return res.json();
}

export async function getHero() {
  const res = await fetch(`${API_URL}/api/hero`);
  return res.json();
}
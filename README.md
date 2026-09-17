# Entre Versos 📖✨

> Palavras que encontram sentimentos. Uma plataforma web minimalista e elegante para publicação e leitura de poemas e reflexões.

---

## 🚀 Tecnologias Utilizadas

O projeto foi desenvolvido com uma arquitetura desacoplada:
* **Front-end:** React + Vite + Tailwind CSS
* **Back-end:** Node.js + Express
* **Banco de Dados:** SQLite
* **Segurança:** JWT (JSON Web Tokens), Bcryptjs e Express Rate Limit

---

## 📦 Funcionalidades

* **Página Inicial Dinâmica:** Banner principal e "Frase do Dia" gerenciados diretamente pelo painel administrativo.
* **Acervo e Exploração:** Listagem de obras com suporte a busca por título/autor/conteúdo e filtros rápidos por sentimentos/tags.
* **Painel Administrativo Seguro:** Área restrita para publicação e exclusão de obras, protegida por autenticação baseada em token e restrição contra ataques de força bruta no login.

---

## 🌐 Visualização do projeto em produção: 

🔗[Visualizar](https://entre-versos-web.vercel.app/)

---

## ⚙️ Como Rodar o Projeto Localmente

Certifique-se de ter o **Node.js** instalado em sua máquina.

### 1. Clonar o repositório
```bash
git clone [https://github.com/seu-usuario/entre-versos.git](https://github.com/seu-usuario/entre-versos.git)
cd entre-versos
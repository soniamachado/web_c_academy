// ============================================================
//  SPA (Single Page Application) — Browser History API
//  Uma só página (index.html) que troca o conteúdo com JavaScript,
//  sem recarregar, e muda o endereço na barra com o history.pushState.
// ============================================================

import {
  AUTH_USER_KEY,
  AUTH_TOKEN_KEY,
  ADMIN_USERNAME,
  API_BASE_URL,
  getAuthenticatedUser,
} from "./utils.js";

// ------------------------------------------------------------
//  Ajudas
// ------------------------------------------------------------

// Cabeçalho com o token JWT, para os pedidos protegidos.
function authHeader() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return { Authorization: `Bearer ${token}` };
}

// Lê uma imagem e devolve-a como Data URL (base64).
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// O elemento <main> onde as vistas são desenhadas.
function app() {
  return document.getElementById("app");
}

// ============================================================
//  VISTAS — o HTML de cada "página" do SPA
// ============================================================

function vistaHome() {
  return `
    <section id="content-title-text">
      <h2>Título</h2>
      <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
    </section>

    <section id="content-video">
      <video controls>
        <source src="placeholder.mp4" type="video/mp4"> O seu browser não suporta a tag de vídeo.
      </video>
    </section>

    <section id="content-table">
      <h3>Tabela de Recursos do Projeto</h3>
      <table>
        <thead>
          <tr><th></th><th>Recurso</th><th>Tipo de Ficheiro</th><th>Utilização</th></tr>
        </thead>
        <tbody>
          <tr><td><img src="img/logo_html.png" alt="html logo"></td><td>Hypertext Markup Language</td><td>.html</td><td>Permite descrever conteúdo de páginas web</td></tr>
          <tr><td><img src="img/logo_css.png" alt="css logo"></td><td>Cascading Style Sheets</td><td>.css</td><td>Responsável pela apresentação e formatação dos elementos HTML</td></tr>
          <tr><td><img src="img/logo_js.png" alt="javascript logo"></td><td>Javascript</td><td>.js</td><td>Permite adicionar comportamento no cliente (browser)</td></tr>
        </tbody>
      </table>
    </section>
  `;
}

function vistaLogin() {
  return `
    <section id="login-registo-area">
      <form id="auth-form">
        <h3>Login</h3>

        <label for="username">Username:</label>
        <input type="text" id="username" required>

        <label for="password">Password:</label>
        <input type="password" id="password" required>

        <div id="register-fields" style="display: none;">
          <label for="reg-photo">Foto de Perfil:</label>
          <input type="file" id="reg-photo" accept="image/*">

          <label for="reg-name">Nome:</label>
          <input type="text" id="reg-name">

          <label for="reg-email">Email:</label>
          <input type="email" id="reg-email">

          <label for="reg-phone">Telemóvel:</label>
          <input type="tel" id="reg-phone" pattern="[0-9]{9}" title="Telemóvel deve ter 9 dígitos (apenas números)">

          <label for="reg-nif">NIF (9 dígitos):</label>
          <input type="text" id="reg-nif" pattern="\\d{9}" title="NIF deve ter 9 dígitos">

          <label for="reg-address">Morada:</label>
          <input type="text" id="reg-address">
        </div>

        <button type="submit" id="submit-auth-btn">Entrar</button>
        <button type="button" id="toggle-register-btn">Mudar para Registo</button>
      </form>
    </section>
  `;
}

function vistaConta() {
  return `
    <section id="conta-area" style="display: flex;">
      <section id="user-profile-info" class="profile-container">
        <img id="profile-photo" src="" alt="Foto de Perfil" class="profile-photo">
        <h3 id="profile-greeting">Olá</h3>
        <section class="profile-details-grid">
          <p><strong>Nome:</strong></p><p id="profile-name"></p>
          <p><strong>Email:</strong></p><p id="profile-email"></p>
          <p><strong>Telemóvel:</strong></p><p id="profile-phone"></p>
          <p><strong>Username:</strong></p><p id="profile-username"></p>
          <p><strong>NIF:</strong></p><p id="profile-nif"></p>
          <p><strong>Morada:</strong></p><p id="profile-address"></p>
        </section>
        <button id="logout-btn-page" class="auth-button" type="button">Sair da Conta (Logout)</button>
      </section>
    </section>
  `;
}

function vistaAdmin() {
  return `
    <section id="admin-area">
      <h3>Lista de Utilizadores Registados</h3>
      <section id="users-table-container">
        <p id="loading-message">A carregar lista de utilizadores...</p>
      </section>
      <button id="logout-btn-page" class="auth-button" type="button">Sair da Conta (Logout)</button>
    </section>
  `;
}

// ============================================================
//  NAVBAR e LOGOUT
// ============================================================

function updateNavBar() {
  const navList = document.querySelector("#menu ul");
  if (!navList) return;

  const user = getAuthenticatedUser();
  // Os links levam data-link para o router os intercetar (navegar sem recarregar).
  let links = `<li><a href="/" data-link>Home</a></li>`;

  if (user && user.username === ADMIN_USERNAME) {
    links += `<li><a href="/admin" data-link>Painel de Administração</a></li>`;
  } else {
    links += `<li><a href="/login" data-link>A minha conta</a></li>`;
  }

  navList.innerHTML = links;
}

function logout() {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  alert("Logout efetuado com sucesso.");
  navegar("/");
}

// ============================================================
//  MONTAGEM — ligar os eventos depois de desenhar cada vista
// ============================================================

// -- Conta: buscar o perfil ao servidor (GET /api/users/profile) e preencher --
async function montarConta() {
  const logoutBtn = document.getElementById("logout-btn-page");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: authHeader(),
    });
    if (!response.ok) {
      console.error("Não foi possível obter o perfil do servidor.");
      return;
    }
    const data = await response.json();
    const user = data.user;

    document.getElementById("profile-photo").src = user.fotografia || "img/default-profile.png";
    document.getElementById("profile-greeting").textContent = `Olá ${user.nome}`;
    document.getElementById("profile-name").textContent = user.nome;
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-username").textContent = user.username;
    document.getElementById("profile-phone").textContent = user.telemovel;
    document.getElementById("profile-nif").textContent = user.nif;
    document.getElementById("profile-address").textContent = user.morada;
  } catch (error) {
    console.error("Erro de rede ao obter o perfil:", error);
  }
}

// -- Login/Registo: ligar o formulário --
function montarLogin() {
  const authForm = document.getElementById("auth-form");
  const registerFields = document.getElementById("register-fields");
  const toggleRegisterBtn = document.getElementById("toggle-register-btn");
  const submitAuthBtn = document.getElementById("submit-auth-btn");

  let isRegisterMode = false;

  // Alternar entre Login e Registo
  toggleRegisterBtn.addEventListener("click", () => {
    isRegisterMode = !isRegisterMode;
    registerFields.style.display = isRegisterMode ? "block" : "none";
    authForm.querySelector("h3").textContent = isRegisterMode
      ? "Registo de Novo Utilizador"
      : "Login";
    submitAuthBtn.textContent = isRegisterMode ? "Registar" : "Entrar";
    toggleRegisterBtn.textContent = isRegisterMode ? "Mudar para Login" : "Mudar para Registo";
    document.getElementById("reg-nif").required = isRegisterMode;
    authForm.reset();
  });

  // Submeter (Registo ou Login)
  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (isRegisterMode) {
      const photoFile = document.getElementById("reg-photo").files[0];
      let photoDataUrl = "";
      const nif = document.getElementById("reg-nif").value;
      const name = document.getElementById("reg-name").value;
      const email = document.getElementById("reg-email").value;
      const phone = document.getElementById("reg-phone").value;
      const address = document.getElementById("reg-address").value;

      if (photoFile) {
        try {
          photoDataUrl = await readFileAsDataURL(photoFile);
        } catch (error) {
          console.error("Erro ao ler o ficheiro de imagem:", error);
          alert("ERRO de Registo: Não foi possível ler o ficheiro de imagem.");
          return;
        }
      }

      const newUserPayload = {
        username: username,
        password: password,
        fotografia: photoDataUrl,
        nome: name,
        email: email,
        telemovel: phone,
        nif: nif,
        morada: address,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUserPayload),
        });
        const data = await response.json();
        if (response.ok) {
          alert(`Registo de ${username} BEM-SUCEDIDO! Pode agora fazer Login.`);
          toggleRegisterBtn.click(); // volta ao modo Login
          authForm.reset();
        } else {
          alert(`ERRO de Registo: ${data.message || "Ocorreu um erro no servidor."}`);
        }
      } catch (error) {
        console.error("Erro de rede durante o registo:", error);
        alert("ERRO de Registo: Falha de comunicação com o servidor.");
      }
    } else {
      const loginPayload = { identifier: username, password: password };
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginPayload),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem(AUTH_TOKEN_KEY, data.token);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
          alert(`Login de ${data.user.username} BEM-SUCEDIDO!`);
          // Navega (sem recarregar) para o painel de admin ou para a conta
          if (data.user.isAdmin) {
            navegar("/admin");
          } else {
            navegar("/login"); // já autenticado -> mostra a página da conta
          }
        } else {
          alert(`ERRO de Login: ${data.message || "Ocorreu um erro no servidor."}`);
        }
      } catch (error) {
        console.error("Erro de rede durante o login:", error);
        alert("ERRO de Login: Falha de comunicação com o servidor.");
      }
    }
  });
}

// -- Admin: lista de utilizadores + apagar --
async function montarAdmin() {
  const logoutBtn = document.getElementById("logout-btn-page");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  await carregarUtilizadores();
}

async function carregarUtilizadores() {
  const container = document.getElementById("users-table-container");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/users`, { headers: authHeader() });
    if (!response.ok) {
      container.innerHTML = "<p>Não foi possível carregar os utilizadores (acesso negado).</p>";
      return;
    }
    const data = await response.json();
    renderUsersTable(data.users);
  } catch (error) {
    console.error("Erro de rede ao carregar utilizadores:", error);
    container.innerHTML = "<p>Erro de comunicação com o servidor.</p>";
  }
}

function renderUsersTable(users) {
  const container = document.getElementById("users-table-container");
  if (!container) return;

  const naoAdmins = [];
  for (const u of users) {
    if (u.username !== ADMIN_USERNAME) naoAdmins.push(u);
  }

  if (naoAdmins.length === 0) {
    container.innerHTML = "<p>Nenhum outro utilizador registado (apenas o Admin).</p>";
    return;
  }

  let html = `
    <table id="users-table">
      <thead>
        <tr><th>Foto</th><th>Username</th><th>Nome</th><th>Email</th><th>NIF</th><th>Ação</th></tr>
      </thead>
      <tbody>
  `;

  for (const user of naoAdmins) {
    const photoSrc = user.fotografia || "img/default-profile.png";
    html += `
      <tr>
        <td><img src="${photoSrc}" alt="Foto"></td>
        <td>${user.username}</td>
        <td>${user.nome}</td>
        <td>${user.email}</td>
        <td>${user.nif || ""}</td>
        <td><button class="remove-btn" data-id="${user._id}" data-username="${user.username}">Remover</button></td>
      </tr>
    `;
  }

  html += "</tbody></table>";
  container.innerHTML = html;

  const botoes = container.querySelectorAll(".remove-btn");
  for (const button of botoes) {
    button.addEventListener("click", (event) => {
      const id = event.target.getAttribute("data-id");
      const username = event.target.getAttribute("data-username");
      removeUser(id, username);
    });
  }
}

async function removeUser(id, username) {
  if (!confirm(`Tem a certeza que deseja remover o utilizador: ${username}?`)) return;

  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    const data = await response.json();
    if (response.ok) {
      alert(`Utilizador ${username} removido com sucesso.`);
      carregarUtilizadores();
    } else {
      alert(`ERRO: ${data.message || "Não foi possível remover."}`);
    }
  } catch (error) {
    console.error("Erro de rede ao remover utilizador:", error);
    alert("ERRO: Falha de comunicação com o servidor.");
  }
}

// ============================================================
//  O ROUTER — decide que vista mostrar conforme o endereço
// ============================================================

function renderRota() {
  updateNavBar(); // o menu é sempre atualizado

  const caminho = window.location.pathname;

  if (caminho === "/admin") {
    const user = getAuthenticatedUser();
    if (user && user.username === ADMIN_USERNAME) {
      app().innerHTML = vistaAdmin();
      montarAdmin();
    } else {
      app().innerHTML = `
        <section id="admin-area">
          <h2>Acesso Restrito</h2>
          <p>Apenas o administrador (${ADMIN_USERNAME}) tem acesso a esta página.</p>
          <p><a href="/login" data-link>Fazer Login</a></p>
        </section>`;
    }
  } else if (caminho === "/login") {
    const user = getAuthenticatedUser();
    if (user) {
      app().innerHTML = vistaConta();
      montarConta();
    } else {
      app().innerHTML = vistaLogin();
      montarLogin();
    }
  } else {
    // "/" ou qualquer outro endereço -> Home
    app().innerHTML = vistaHome();
  }
}

// Muda o endereço na barra (sem recarregar) e desenha a vista.
function navegar(caminho) {
  window.history.pushState({}, "", caminho);
  renderRota();
}

// Interceta cliques em links com [data-link] -> navega sem recarregar a página.
document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-link]");
  if (link) {
    event.preventDefault();
    navegar(link.getAttribute("href"));
  }
});

// Botões Voltar/Avançar do browser.
window.addEventListener("popstate", renderRota);

// Arranque: desenha a vista correspondente ao endereço atual.
document.addEventListener("DOMContentLoaded", renderRota);

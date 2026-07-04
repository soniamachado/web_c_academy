import {
  getAuthenticatedUser,
  logoutUser,
  updateNavBar,
  ADMIN_USERNAME,
  AUTH_TOKEN_KEY,
  API_BASE_URL,
} from "./utils.js";

/**
 * Devolve o cabeçalho de autorização com o token JWT guardado no localStorage.
 */
function authHeader() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return { Authorization: `Bearer ${token}` };
}

/**
 * Vai buscar a lista de utilizadores ao servidor (GET /api/users) e desenha a tabela.
 */
async function carregarUtilizadores() {
  const container = document.getElementById("users-table-container");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: authHeader(),
    });

    // Se o servidor recusar (sem token ou não é admin)
    if (!response.ok) {
      container.innerHTML =
        "<p>Não foi possível carregar os utilizadores (acesso negado).</p>";
      return;
    }

    const data = await response.json();
    renderUsersTable(data.users);
  } catch (error) {
    console.error("Erro de rede ao carregar utilizadores:", error);
    container.innerHTML =
      "<p>Erro de comunicação com o servidor.</p>";
  }
}

/**
 * Desenha a tabela de utilizadores no ecrã.
 * Usa os nomes dos campos do servidor: nome, email, nif, fotografia, _id.
 */
function renderUsersTable(users) {
  const container = document.getElementById("users-table-container");
  if (!container) return;

  // Não mostrar o próprio admin na lista
  const naoAdmins = [];
  for (const u of users) {
    if (u.username !== ADMIN_USERNAME) {
      naoAdmins.push(u);
    }
  }

  if (naoAdmins.length === 0) {
    container.innerHTML =
      "<p>Nenhum outro utilizador registado (apenas o Admin).</p>";
    return;
  }

  let htmlContent = `
    <table id="users-table">
      <thead>
        <tr>
          <th>Foto</th>
          <th>Username</th>
          <th>Nome</th>
          <th>Email</th>
          <th>NIF</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const user of naoAdmins) {
    const photoSrc = user.fotografia || "img/default-profile.png";
    htmlContent += `
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

  htmlContent += "</tbody></table>";
  container.innerHTML = htmlContent;

  // Ligar os botões de remover
  const botoes = container.querySelectorAll(".remove-btn");
  for (const button of botoes) {
    button.addEventListener("click", (event) => {
      const id = event.target.getAttribute("data-id");
      const username = event.target.getAttribute("data-username");
      removeUser(id, username);
    });
  }
}

/**
 * Apaga um utilizador no servidor (DELETE /api/users/:id) e recarrega a lista.
 */
async function removeUser(id, username) {
  if (!confirm(`Tem a certeza que deseja remover o utilizador: ${username}?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Utilizador ${username} removido com sucesso.`);
      carregarUtilizadores(); // Recarrega a lista atualizada do servidor
    } else {
      alert(`ERRO: ${data.message || "Não foi possível remover."}`);
    }
  } catch (error) {
    console.error("Erro de rede ao remover utilizador:", error);
    alert("ERRO: Falha de comunicação com o servidor.");
  }
}

// Lógica principal da página de Admin
document.addEventListener("DOMContentLoaded", () => {
  const adminArea = document.getElementById("admin-area");
  const user = getAuthenticatedUser();

  updateNavBar();

  if (!adminArea) return;

  // Verificar se o utilizador está logado E é o admin
  if (user && user.username === ADMIN_USERNAME) {
    carregarUtilizadores();

    const logoutBtnAdmin = document.getElementById("logout-btn-page");
    if (logoutBtnAdmin) {
      logoutBtnAdmin.addEventListener("click", logoutUser);
    }
  } else {
    // Não é o admin ou não está logado
    adminArea.innerHTML = `
      <h2>Acesso Restrito</h2>
      <p>Apenas o administrador (${ADMIN_USERNAME}) tem acesso a esta página.</p>
      <p><a href="login.html">Fazer Login</a></p>
    `;
  }
});

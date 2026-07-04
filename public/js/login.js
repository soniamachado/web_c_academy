// Adicionar imports **

import {
  getUsers,
  getAuthenticatedUser,
  logoutUser,
  updateNavBar,
  ADMIN_USERNAME,
  AUTH_USER_KEY,
  AUTH_TOKEN_KEY,
  API_BASE_URL,
} from "./utils.js";
/**
 * Lê um ficheiro (imagem) e retorna o conteúdo como Data URL (string base64).
 * @param {File} file - O objeto File selecionado pelo utilizador.
 * @returns {Promise<string>} Uma Promise que resolve com o Data URL.
 */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Atualiza os campos do perfil com os dados do utilizador autenticado.
 */
function renderAccountPage(user) {
  // Seleciona os elementos pelos IDs (definidos estaticamente no HTML)
  const photoUser = document.getElementById("profile-photo");
  const profileGreeting = document.getElementById("profile-greeting");
  const nameUser = document.getElementById("profile-name");
  const usernameUser = document.getElementById("profile-username");
  const emailUser = document.getElementById("profile-email");
  const phoneUser = document.getElementById("profile-phone");
  const nifUser = document.getElementById("profile-nif");
  const addressUser = document.getElementById("profile-address");

  if (photoUser && nameUser && usernameUser && nifUser && addressUser) {
    // Atualiza a Foto
    // Se photoUrl estiver vazio, usa uma imagem padrão
    photoUser.src = user.fotografia || "img/default-profile.png";
    // Atualiza os textos (nomes de campos do servidor: nome, telemovel, morada...)
    profileGreeting.textContent = `Olá ${user.nome}`;
    nameUser.textContent = user.nome;
    emailUser.textContent = user.email;
    usernameUser.textContent = user.username;
    phoneUser.textContent = user.telemovel;
    nifUser.textContent = user.nif;
    addressUser.textContent = user.morada;
  } else {
    console.error(
      "Erro: Não foi possível encontrar todos os elementos do perfil no DOM para atualização.",
    );
  }
}

/**
 * Vai buscar o perfil completo do utilizador ao servidor (GET /api/users/profile)
 * e desenha a página da conta. Usa o token JWT para o servidor saber quem é.
 */
async function carregarPerfil() {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      console.error("Não foi possível obter o perfil do servidor.");
      return;
    }

    const data = await response.json();
    renderAccountPage(data.user); // Desenha com os dados completos vindos da base de dados
  } catch (error) {
    console.error("Erro de rede ao obter o perfil:", error);
  }
}

// Espera que todo o HTML seja carregado antes de executar o código
document.addEventListener("DOMContentLoaded", () => {
  updateNavBar();

  // Seleção de Elementos DOM
  const authForm = document.getElementById("auth-form");
  const registerFields = document.getElementById("register-fields");
  const toggleRegisterBtn = document.getElementById("toggle-register-btn");
  const submitAuthBtn = document.getElementById("submit-auth-btn");

  const loginRegistoArea = document.getElementById("login-registo-area");
  const contaArea = document.getElementById("conta-area");

  // Variável de Estado para controlar o modo (Login ou Registo)
  let isRegisterMode = false;

  // ----------------------------------------------------
  // Alternar entre Login e Registo
  // ----------------------------------------------------
  if (toggleRegisterBtn) {
    toggleRegisterBtn.addEventListener("click", () => {
      isRegisterMode = !isRegisterMode;

      // Alterna visibilidade dos campos adicionais
      registerFields.style.display = isRegisterMode ? "block" : "none";

      // Altera o texto dos elementos DOM
      authForm.querySelector("h3").textContent = isRegisterMode
        ? "Registo de Novo Utilizador"
        : "Login";
      submitAuthBtn.textContent = isRegisterMode ? "Registar" : "Entrar";
      toggleRegisterBtn.textContent = isRegisterMode
        ? "Mudar para Login"
        : "Mudar para Registo";

      // Define o NIF como obrigatório SÓ no modo Registo
      document.getElementById("reg-nif").required = isRegisterMode;

      authForm.reset();
    });
  }

  // ----------------------------------------------------
  // Processamento do Formulário (Login/Registo)
  // ----------------------------------------------------
  const user = getAuthenticatedUser();

  if (user) {
    contaArea.style = "display: flex;";
    loginRegistoArea.style = "display: none;";

    carregarPerfil(); // Busca o perfil completo à API e desenha a página da conta

    const logoutBtnPage = document.getElementById("logout-btn-page");
    if (logoutBtnPage) {
      logoutBtnPage.addEventListener("click", logoutUser);
    }
  }

  if (authForm) {
    authForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Recolha de Dados
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const users = getUsers();

      // Lógica de Registo (Executa se isRegisterMode for TRUE)
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
            alert(
              "ERRO de Registo: Não foi possível ler o ficheiro de imagem.",
            );
            return;
          }
        }

        // Validação de NIF
        if (!/^\d{9}$/.test(nif)) {
          alert("ERRO de Registo: O NIF deve conter 9 dígitos.");
          return;
        }

        // Validação do tlm
        if (!/^\d{9}$/.test(phone)) {
          alert("ERRO de Registo: O telemóvel deve conter 9 dígitos.");
          return;
        }

        // Validação de E-mail
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          alert("ERRO de Registo: Formato de e-mail inválido.");
          return;
        }
        // Criar o objeto de dados (Payload) para enviar ao servidor
        const newUserPayload = {
          username: username,
          password: password,
          fotografia: photoDataUrl, // O nome do campo é 'fotografia' (ver User.js)
          nome: name,
          email: email,
          telemovel: phone, // O nome do campo é 'telemovel' (ver User.js)
          nif: nif,
          morada: address, // O nome do campo é 'morada' (ver User.js)
        };

        // Enviar o pedido POST para o servidor
        try {
          // Rota: http://localhost:3000/api/auth/register
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST", // Usamos POST para enviar os novos dados
            headers: {
              "Content-Type": "application/json", // OBRIGATÓRIO: Para indicar que o corpo é JSON
            },
            body: JSON.stringify(newUserPayload), // Converte o objeto JS para string JSON
          });

          const data = await response.json(); // O authController.js responderá com JSON

          // Tratar a Resposta do Servidor
          if (response.ok) {
            alert(`Registo de ${username} BEM-SUCEDIDO! Pode agora fazer Login.`);

            // Finalização no Frontend
            toggleRegisterBtn.click(); // Muda automaticamente para o modo Login
            authForm.reset();
          } else {
            // Trata erros vindos do servidor
            alert(`ERRO de Registo: ${data.message || "Ocorreu um erro no servidor."}`);
          }
        } catch (error) {
          // Trata erros de rede (Servidor desligado, problemas de CORS, etc.)
          console.error("Erro de rede durante o registo:", error);
          alert("ERRO de Registo: Falha de comunicação com o servidor.");
        }
      }

      // Lógica de Login (Executa se isRegisterMode for FALSE)
      else {
        // Criar o objeto a enviar ao servidor.
        // 'identifier' pode ser o username OU o email (ver authController.js)
        const loginPayload = {
          identifier: username,
          password: password,
        };

        // Enviar o pedido POST para o servidor
        try {
          // Rota: http://localhost:3000/api/auth/login
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(loginPayload),
          });

          const data = await response.json(); // O authController.js responde com JSON

          if (response.ok) {
            // Guardar o Token JWT devolvido pelo servidor (para chamadas futuras à API)
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);

            // Guardar os dados do utilizador autenticado (para a navbar / sessão)
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

            alert(`Login de ${data.user.username} BEM-SUCEDIDO!`);

            // Redirecionamento consoante o tipo de utilizador
            if (data.user.isAdmin) {
              window.location.href = "admin.html"; // Admin vai para o painel
            } else {
              window.location.href = "login.html"; // Utilizador normal vai para a conta
            }
          } else {
            // Trata erros vindos do servidor (ex: credenciais inválidas)
            alert(`ERRO de Login: ${data.message || "Ocorreu um erro no servidor."}`);
          }
        } catch (error) {
          // Trata erros de rede (servidor desligado, CORS, etc.)
          console.error("Erro de rede durante o login:", error);
          alert("ERRO de Login: Falha de comunicação com o servidor.");
        }
      }
    });
  }
});

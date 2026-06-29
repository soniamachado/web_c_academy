// Vai buscar o array de utilizadores guardado no localStorage (o mesmo do registo).
// Se ainda não existir nenhum, devolve um array vazio.
function getUtilizadores() {
  let dados = localStorage.getItem("utilizadores");

  if (dados === null) {
    return [];
  }

  return JSON.parse(dados);
}

// Preenche o perfil com os dados do utilizador,
// esconde o formulário e mostra a secção do perfil.
function mostrarPerfil(utilizador) {
  // preencher cada espaço (span) com o respetivo dado
  document.getElementById("perfil-ola").innerText =
    "Olá, " + utilizador.name + "!";
  document.getElementById("perfil-nome").innerText = "Nome: " + utilizador.name;
  document.getElementById("perfil-email").innerText =
    "Email: " + utilizador.email;
  document.getElementById("perfil-telemovel").innerText =
    "Telemóvel: " + utilizador.telemovel;
  document.getElementById("perfil-username").innerText =
    "Username: " + utilizador.username;
  document.getElementById("perfil-nif").innerText = "NIF: " + utilizador.nif;
  document.getElementById("perfil-morada").innerText =
    "Morada: " + utilizador.morada;

  // esconder o formulário e mostrar o perfil
  document.getElementById("vista-formulario").style.display = "none";
  document.getElementById("vista-perfil").style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  // Só fazemos o que está dentro da função quando o DOMContentLoaded é chamado
  let login = document.getElementById("login"); // vai buscar o formulário com o id "login"

  login.addEventListener("submit", (event) => {
    // quando o botão do tipo "submit" é selecionado executa o que está aqui dentro
    event.preventDefault();

    // 1. Ir buscar o que o utilizador escreveu
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username === "admin" && password === "admin") {    
      window.location.href = "paginaAdmin.html";    
      return;  
    }

    // 2. Ir buscar todos os utilizadores registados
    let utilizadores = getUtilizadores();

    // 3. Procurar um utilizador com o mesmo username e password
    let utilizador = utilizadores.find(
      (u) => u.username === username && u.password === password
    );

    if (utilizador === undefined) {
      alert("Utilizador ou palavra-passe incorretos!");    
      return;  

    }

    console.log("Login com sucesso:", utilizador);

    // 4. Verificar se encontrou
    if (utilizador === undefined) {
      alert("Utilizador ou palavra-passe incorretos!");
      return;
    }

    console.log("Login com sucesso:", utilizador);

    // mostrar a página de perfil com os dados deste utilizador
    mostrarPerfil(utilizador);
  });
});

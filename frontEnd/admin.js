

// Simulação de utilizadores (podes depois substituir por localStorage)
let utilizadores = [
    { username: "utilizadorRemover", nome: "Nome do Utilizador" },
    { username: "nuno", nome: "Nuno Baptista" },
    { username: "sonia", nome: "Sónia Machado" },
    { username: "isabel", nome: "Isabel Soares" }
];

// Carregar lista ao abrir a página
window.onload = function () {
  carregarUtilizadores();
};

// Criar lista dinamicamente
function carregarUtilizadores() {
  const lista = document.getElementById("lista-utilizadores");
  lista.innerHTML = "";

  utilizadores.forEach((u) => {
    const li = document.createElement("li");
    li.textContent = u.nome + " (" + u.username + ")";
    lista.appendChild(li);
  });
}

// Remover o primeiro utilizador
function removerPrimeiroUtilizador() {
  if (utilizadores.length > 0) {
    utilizadores.shift();
    carregarUtilizadores();
  } else {
    alert("Não há utilizadores para remover.");
  }
}
// Vai buscar TODOS os campos do formulário e junta-os num objeto (uma "ficha" de utilizador)
function getDadosUtilizador() {
  let utilizador = {
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    telemovel: document.getElementById("telemovel").value,
    nif: document.getElementById("nif").value,
    morada: document.getElementById("morada").value,
  };
  // "return" = a função devolve este objeto para quem a chamou
  return utilizador;
}
//Primeiro crio duas funções pequenas: uma para ler a lista que já existe, outra para guardar a lista atualizada.
// Vai buscar a lista de utilizadores guardada no localStorage.
// Se ainda não existir nenhuma, devolve uma lista vazia [].
function getUtilizadores() {
  let dados = localStorage.getItem("utilizadores"); // isto vem como texto (ou null)
  if (dados === null) {
    return []; // primeira vez: ainda não há nada guardado
  }
  // transforma o texto de volta num array de objetos
  return JSON.parse(dados);
}

// Guarda a lista de utilizadores no localStorage.
function guardarUtilizadores(lista) {
  // transforma o array em texto, porque o localStorage só guarda texto
  localStorage.setItem("utilizadores", JSON.stringify(lista));
}

document.addEventListener("DOMContentLoaded", () => {
  //Só fazemos o que está dentro da função quando o DOMContentLoaded é chamado
  let login = document.getElementById("registo"); // vai buscar o elemento que tem o id como "registo"
  login.addEventListener("submit", async (event) => {
    // quando o botão do tipo "submit" é selecionado executa o que está aqui dentro
    event.preventDefault();

    // 1. apanhar a ficha que o utilizador preencheu
    let novoUtilizador = getDadosUtilizador();

    // 2. ir buscar a lista que já existe (ou [] se for a primeira vez)
    let utilizadores = getUtilizadores();

    // 3. verificar se já existe alguém com este username
    //    .some() devolve true se ALGUM utilizador da lista cumprir a condição
    let jaExiste = utilizadores.some(
      (u) => u.username === novoUtilizador.username,
    );

    if (jaExiste) {
      alert("Esse nome de utilizador já está registado!");
      return; // pára aqui: não adiciona nem guarda
    }

    // 4. juntar o novo utilizador ao fim da lista
    utilizadores.push(novoUtilizador);

    // 5. voltar a guardar a lista atualizada no localStorage
    guardarUtilizadores(utilizadores);

    // confirmar no console
    console.log("Novo utilizador:", novoUtilizador);
    console.log("Lista completa:", utilizadores);

    // 6. dar feedback ao utilizador e limpar o formulário
    alert("Registo efetuado com sucesso!");
    login.reset();
  });
});

//FALTA:
// Capazes de ir buscar toda a informação - seguir o que fizemos até agora
// Guardar num array

//SUGESTÃO DA PROFESSORA:
//Basear-nos no exemplo do carro dos slides
// Criar um array de objetos/utilizadores
// LOCALSTORAGE

const User = require("../models/User"); // O modelo de utilizador

// Dados do administrador principal.
// A password fica em texto simples AQUI, mas é gravada com hash (o hook do modelo trata disso).
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123"; // Password inicial do admin (podem mudar)

// Cria o administrador na base de dados, mas SÓ se ele ainda não existir.
// É chamada uma vez, no arranque do servidor, depois de ligar ao MongoDB.
async function seedAdmin() {
  try {
    const existingAdmin = await User.findOne({ username: ADMIN_USERNAME });

    if (existingAdmin) {
      // Já existe -> não faz nada (evita criar admins repetidos a cada reinício)
      return;
    }

    const admin = new User({
      username: ADMIN_USERNAME,
      email: "admin@app.com",
      password: ADMIN_PASSWORD,
      nome: "Administrador",
      isAdmin: true, // A flag que dá privilégios de administrador
    });

    await admin.save();
    console.log("Administrador criado com sucesso (username: admin).");
  } catch (error) {
    console.error("ERRO ao criar o administrador:", error.message);
  }
}

module.exports = seedAdmin;

const User = require("../models/User"); // Para usar o modelo de utilizador definido em Mongoose
const jwt = require("jsonwebtoken"); // Para gerir tokens válidos durante sessões de uso da API
const bcrypt = require("bcrypt"); // Para comparar a password com o hash guardado
const { JWT_SECRET, TOKEN_EXPIRATION } = require("../config/jwt"); // Segredo partilhado
const DOMPurify = require("isomorphic-dompurify"); // Para limpar texto malicioso (XSS)

// Função auxiliar: "limpa" um texto, removendo HTML/JS malicioso.
// Se o valor não existir, devolve-o tal como está.
function limpar(valor) {
  if (typeof valor !== "string") return valor;
  return DOMPurify.sanitize(valor.trim());
}
exports.register = async (req, res) => {
  try {
    // Sanitização: "limpar" os campos de texto para remover código malicioso (XSS)
    const username = limpar(req.body.username);
    const email = limpar(req.body.email);
    const password = req.body.password; // A password NÃO se sanitiza (vai virar hash)
    const nome = limpar(req.body.nome);
    const telemovel = limpar(req.body.telemovel);
    const nif = limpar(req.body.nif);
    const morada = limpar(req.body.morada);
    const fotografia = req.body.fotografia; // A foto é um Data URL longo; não se sanitiza

    // Validação: confirmar que os campos obrigatórios foram preenchidos
    if (!username || !email || !password || !nome) {
      return res.status(400).json({
        success: false,
        message: "Faltam campos obrigatórios (username, email, password, nome).",
      });
    }

    // Validação: confirmar que o email tem um formato válido
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
      return res.status(400).json({
        success: false,
        message: "O formato do email é inválido.",
      });
    }

    // Validação de Unicidade, ou seja não pode existir um outro utilizador na base de dados com o mesmo username ou email.
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username ou email já registados.",
      });
    }

    // Criar o novo utilizador
    const newUser = new User({
      username,
      email,
      password, // O hash é feito automaticamente pelo hook pre("save") do modelo User
      nome,
      telemovel,
      nif,
      morada,
      fotografia,
      // A flag isAdmin é 'false' por defeito (definido no Schema)
    });

    // Guardar no MongoDB o novo utilizador que criámos.  Se não for possível gravar os dados do utilizador, o processamento passa para o bloco catch da função.
    await newUser.save();

    // Resposta de Sucesso
    res.status(201).json({
      success: true,
      message: "Utilizador registado com sucesso.",
      user: {
        username: newUser.username,
        email: newUser.email,
        nome: newUser.nome,
      },
    });
  } catch (error) {
    console.error("Erro no registo:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor durante o registo.",
    });
  }
};
//11. Implementem a função de login:
exports.login = async (req, res) => {
  try {
    const identifier = limpar(req.body.identifier); // 'identifier' pode ser username ou e-mail
    const password = req.body.password;

    // Validação: confirmar que ambos os campos foram enviados
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Faltam o identificador e/ou a password.",
      });
    }

    // Encontrar o utilizador com base no username ou e-mail
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas.",
      });
    }

    // Compara a password escrita com o hash guardado na base de dados.
    // O bcrypt "refaz" o hash da password escrita e compara com o guardado.
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas.",
      });
    }

    // Geração do JWT (JSON Web Tokens)
    // O payload deve conter a informação mínima necessária para identificar o utilizador e autorização
    const payload = {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

    // Resposta de Sucesso
    res.status(200).json({
      success: true,
      message: "Login bem-sucedido.",
      token, // Este token deverá ser guardado no frontend (localStorage)
      user: { username: user.username, isAdmin: user.isAdmin, nome: user.nome },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor durante o login.",
    });
  }
};

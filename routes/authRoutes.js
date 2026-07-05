const express = require("express");
const router = express.Router(); // Cria uma nova instância de um objeto Router para agrupar rotas de forma lógica
const { body, validationResult } = require("express-validator"); // Para validar e sanitizar os dados
const authController = require("../controllers/authController"); // Importa o authController (login, register, etc.)

// Middleware que corre DEPOIS das regras: verifica se houve erros de validação.
// Se houver, responde logo com 400 e a mensagem; se não, deixa passar para o controller.
function validar(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: erros.array()[0].msg, // a primeira mensagem de erro (a mais útil para o utilizador)
      erros: erros.array(), // a lista completa, caso o frontend queira mostrar tudo
    });
  }
  next();
}

// Regras de validação + sanitização para o REGISTO.
// .trim() e .escape() sanitizam (limpam); .notEmpty()/.isEmail()/.isLength() validam.
const regrasRegisto = [
  body("username").trim().notEmpty().withMessage("O username é obrigatório.").escape(),
  body("email")
    .trim()
    .notEmpty().withMessage("O email é obrigatório.")
    .isEmail().withMessage("O formato do email é inválido.")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("A password é obrigatória.")
    .isLength({ min: 6 }).withMessage("A password deve ter pelo menos 6 caracteres."),
  body("nome").trim().notEmpty().withMessage("O nome é obrigatório.").escape(),
  // Campos opcionais: se vierem, são limpos; se não vierem, não dão erro.
  body("telemovel").optional().trim().escape(),
  body("nif").optional().trim().escape(),
  body("morada").optional().trim().escape(),
];

// Regras para o LOGIN
const regrasLogin = [
  body("identifier").trim().notEmpty().withMessage("O identificador é obrigatório.").escape(),
  body("password").notEmpty().withMessage("A password é obrigatória."),
];

// As regras e o 'validar' correm ANTES do controller.
router.post("/register", regrasRegisto, validar, authController.register); // Registo de novos utilizadores
router.post("/login", regrasLogin, validar, authController.login); // Login de um utilizador

module.exports = router;

const jwt = require("jsonwebtoken"); // Para verificar (descodificar) o token JWT
const { JWT_SECRET } = require("../config/jwt"); // O mesmo segredo usado para criar o token

// Middleware que PROTEGE uma rota: só deixa passar quem enviar um token válido.
// O token vem no header "Authorization: Bearer <token>".
function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  // Confirma que o header existe e começa por "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Acesso negado. Token em falta.",
    });
  }

  // Separa a palavra "Bearer" do token em si
  const token = authHeader.split(" ")[1];

  try {
    // Verifica o token. Se for inválido ou expirado, salta para o catch.
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // Guarda os dados do utilizador no pedido (id, username, isAdmin)
    next(); // Tudo bem -> segue para a rota
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido ou expirado.",
    });
  }
}

// Middleware que só deixa passar ADMINISTRADORES.
// Deve ser usado SEMPRE depois do 'protect' (que preenche o req.user).
function adminOnly(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Acesso restrito a administradores.",
    });
  }
  next();
}

module.exports = { protect, adminOnly };

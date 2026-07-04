// Segredo usado para assinar e verificar os tokens JWT.
// Fica num único ficheiro para ser partilhado pelo authController (que cria o token)
// e pelo middleware (que o verifica), evitando ter o segredo duplicado.
const JWT_SECRET = "a_vossa_chave_secreta_muito_segura";
const TOKEN_EXPIRATION = "1h"; // O token expira ao fim de 1 hora

module.exports = { JWT_SECRET, TOKEN_EXPIRATION };

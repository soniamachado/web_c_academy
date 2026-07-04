// Segredo usado para assinar e verificar os tokens JWT.
// Fica num único ficheiro para ser partilhado pelo authController (que cria o token)
// e pelo middleware (que o verifica), evitando ter o segredo duplicado.
// Lê os valores das variáveis de ambiente (do ficheiro .env).
// O "|| ..." é um valor de recurso, usado só se a variável não estiver definida.
const JWT_SECRET = process.env.JWT_SECRET || "segredo_por_defeito_mudar";
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || "1h"; // O token expira ao fim de 1 hora

module.exports = { JWT_SECRET, TOKEN_EXPIRATION };

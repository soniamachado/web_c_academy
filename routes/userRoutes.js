const express = require("express");
const router = express.Router(); // Agrupa as rotas de utilizadores
const userController = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware"); // Proteção com JWT

// GET /api/users/profile -> perfil do próprio utilizador (basta estar autenticado)
router.get("/profile", protect, userController.getProfile);

// GET /api/users -> lista todos os utilizadores (só admin)
router.get("/", protect, adminOnly, userController.getAllUsers);

// DELETE /api/users/:id -> apaga um utilizador pelo id (só admin)
router.delete("/:id", protect, adminOnly, userController.deleteUser);

module.exports = router;

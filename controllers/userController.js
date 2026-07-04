const User = require("../models/User"); // O modelo de utilizador

const ADMIN_USERNAME = "admin"; // Username do administrador principal (não pode ser apagado)

// GET /api/users/profile
// Devolve o perfil do PRÓPRIO utilizador autenticado.
// O id vem do token (req.user), preenchido pelo middleware 'protect'.
exports.getProfile = async (req, res) => {
  try {
    // .select("-password") -> devolve o utilizador SEM o campo da password
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilizador não encontrado.",
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Erro ao obter o perfil:", error);
    res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
};

// GET /api/users
// Devolve a lista de TODOS os utilizadores (sem as passwords). Só admin.
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Erro ao listar utilizadores:", error);
    res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
};

// DELETE /api/users/:id
// Apaga um utilizador pelo seu id. Só admin. Não permite apagar o admin principal.
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilizador não encontrado.",
      });
    }

    // Proteção: nunca apagar o administrador principal
    if (user.username === ADMIN_USERNAME) {
      return res.status(403).json({
        success: false,
        message: "Não é permitido apagar o administrador principal.",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Utilizador apagado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao apagar utilizador:", error);
    res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
};

const mongoose = require("mongoose"); // Importa o Mongoose, a biblioteca ODM para o MongoDB.
const bcrypt = require("bcrypt"); // Para fazer hash das passwords antes de as guardar

const SALT_ROUNDS = 10; // Número de "voltas" do bcrypt. Quanto maior, mais lento (e mais seguro).

const UserSchema = new mongoose.Schema(
  {
    // Cria um novo Esquema Mongoose, definindo a estrutura dos documentos de utilizador
    username: {
      type: String,
      required: true, // É um campo obrigatório para criar um novo utilizador
      unique: true, // Garante que não existem dois utilizadores com o mesmo username
      trim: true, // Remove espaços em branco no início e no fim da string antes de guardar.
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // Converte a string para minúsculas antes de guardar
    },
    password: {
      type: String,
      required: true,
    },
    nome: {
      type: String,
      required: true,
    },

    // Opcionais ou sujeitos a validação de formato
    telemovel: String,
    nif: String,
    morada: String,
    fotografia: String,

    // Campo de Autorização (Para a área de Administrador)
    isAdmin: {
      type: Boolean,
      default: false, // Por defeito, um utilizador registado NÃO é admin
    },
  },
  {
    timestamps: true, // Adiciona automaticamente os campos createdAt e updatedAt
  },
);

// Hook executado ANTES de gravar um utilizador (save).
// Faz o hash da password apenas se ela foi definida ou alterada,
// para não voltar a fazer hash de uma password que já está encriptada.
UserSchema.pre("save", async function () {
  // Se a password não foi alterada, termina sem fazer nada
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS); // Gera um "sal" único
  this.password = await bcrypt.hash(this.password, salt); // Substitui a password pelo hash
  // Numa função async não é preciso chamar next(): o Mongoose espera pela promessa.
});

const User = mongoose.model("User", UserSchema); // Cria o modelos no Mongoose, que atua como interface para a coleção do MongoDB

module.exports = User; // Exporta o Modelo 'User'

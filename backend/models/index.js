const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
  }
);

const models = {
  Question: require("./question")(sequelize, Sequelize.DataTypes),
  Option: require("./option")(sequelize, Sequelize.DataTypes),
  UserResponse: require("./userresponse")(sequelize, Sequelize.DataTypes),
};

// Add associations
models.Question.hasMany(models.Option, {
  foreignKey: "question_id",
  onDelete: "CASCADE",
});
models.Option.belongsTo(models.Question, {
  foreignKey: "question_id",
  onDelete: "CASCADE",
});

models.Question.hasMany(models.UserResponse, {
  foreignKey: "question_id",
  onDelete: "CASCADE",
});
models.UserResponse.belongsTo(models.Question, {
  foreignKey: "question_id",
  onDelete: "CASCADE",
});

// Export sequelize instance and models
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;

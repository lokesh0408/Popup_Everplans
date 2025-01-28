"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserResponse extends Model {
    static associate(models) {
      // Define association with Question model
      UserResponse.belongsTo(models.Question, {
        foreignKey: "question_id",
        onDelete: "CASCADE",
      });
    }
  }
  UserResponse.init(
    {
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      answer_text: {
        type: DataTypes.STRING,
        allowNull: true, // Answer can be null if not provided
      },
      answer_json: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "UserResponse",
    }
  );
  return UserResponse;
};

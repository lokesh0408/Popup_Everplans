"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  Question.init(
    {
      question_text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("single", "multiple"),
        allowNull: false,
      },
      step: {
        type: DataTypes.FLOAT,
        unique: true,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Question",
    },
    {
      timestamps: false, // disable timestamps
    }
  );
  return Question;
};

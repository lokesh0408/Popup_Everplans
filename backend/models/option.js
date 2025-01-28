"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Option extends Model {
    static associate(models) {
      // Define association with Question model
      Option.belongsTo(models.Question, {
        foreignKey: "question_id",
        onDelete: "CASCADE",
      });
    }
  }
  Option.init(
    {
      option_text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Option",
    },
    {
      timestamps: false, // disable timestamps
    }
  );
  return Option;
};

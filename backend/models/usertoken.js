"use strict";
const { Model } = require("sequelize");
const moment = require("moment-timezone");

module.exports = (sequelize, DataTypes) => {
  class UserToken extends Model {
    static associate(models) {
      // Define any necessary associations
    }
  }

  UserToken.init(
    {
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => moment().tz("Asia/Kolkata").toDate(),
        get() {
          return moment(this.getDataValue("createdAt"))
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD HH:mm:ss");
        },
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => moment().tz("Asia/Kolkata").toDate(),
        get() {
          return moment(this.getDataValue("updatedAt"))
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD HH:mm:ss");
        },
      },
    },
    {
      sequelize,
      modelName: "UserToken",
      timestamps: true,
      hooks: {
        beforeCreate: (record) => {
          record.createdAt = moment().tz("Asia/Kolkata").toDate();
          record.updatedAt = moment().tz("Asia/Kolkata").toDate();
        },
        beforeUpdate: (record) => {
          record.updatedAt = moment().tz("Asia/Kolkata").toDate();
        },
      },
    }
  );

  return UserToken;
};

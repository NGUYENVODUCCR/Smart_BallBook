import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.model.js";

class PasswordReset extends Model {}

PasswordReset.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "password_reset",
    tableName: "password_resets",
    timestamps: true,
  }
);

PasswordReset.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(PasswordReset, { foreignKey: "user_id" });

export default PasswordReset;

import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  role: {
    type: DataTypes.ENUM("User", "Manager", "Admin"),
    defaultValue: "User",
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: "user",
  tableName: "users"
});

export default User;

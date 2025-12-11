import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail(value) {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error("Email không hợp lệ");
        }
      },
    },
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

    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    gender: {
      type: DataTypes.ENUM("Nam", "Nữ", "Khác"),
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    facebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "user",
    tableName: "users",
    timestamps: true,
  }
);

export default User;

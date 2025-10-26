import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class Field extends Model {}

Field.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price_per_hour: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("available", "unavailable"),
    defaultValue: "available",
  },
}, {
  sequelize,
  modelName: "field",
  tableName: "fields",
  timestamps: true,
});

export default Field;

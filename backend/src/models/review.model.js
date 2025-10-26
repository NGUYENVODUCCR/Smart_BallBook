import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.model.js";
import Field from "./field.model.js";

class Review extends Model {}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "review",
    tableName: "reviews",
    timestamps: true,
  }
);

Review.belongsTo(User, { foreignKey: "user_id", as: "user" });
Review.belongsTo(Field, { foreignKey: "field_id", as: "field" });

User.hasMany(Review, { foreignKey: "user_id" });
Field.hasMany(Review, { foreignKey: "field_id" });

export default Review;

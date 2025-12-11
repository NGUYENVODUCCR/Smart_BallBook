import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.model.js";
import Field from "./field.model.js";

class Booking extends Model {}

Booking.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  total_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "paid", "cancelled", "expired"),
    defaultValue: "pending",
  },
}, {
  sequelize,
  modelName: "booking",
  tableName: "bookings",
  timestamps: true,
});

Booking.belongsTo(User, { foreignKey: "user_id", as: "user" });
Booking.belongsTo(Field, { foreignKey: "field_id", as: "field" });

User.hasMany(Booking, { foreignKey: "user_id" });
Field.hasMany(Booking, { foreignKey: "field_id" });

export default Booking;

import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";
import Booking from "./booking.model.js";

class QRCheckin extends Model {}

QRCheckin.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    qr_code: {
      type: DataTypes.TEXT('long'), 
      allowNull: false,
    },

    booking_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Booking,
        key: "id",
      },
      onDelete: "CASCADE",
    },

    is_scanned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    scanned_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "QRCheckin",
    tableName: "qr_checkins",
    timestamps: true,
  }
);

// Quan hệ
QRCheckin.belongsTo(Booking, { foreignKey: "booking_id", as: "booking" });
Booking.hasOne(QRCheckin, { foreignKey: "booking_id", as: "qr" });

export default QRCheckin;

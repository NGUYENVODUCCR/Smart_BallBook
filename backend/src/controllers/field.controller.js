import Field from "../models/field.model.js";
import Booking from "../models/booking.model.js";

import axios from "axios";
import { Op } from "sequelize";

// API AI NLP (render)
const NLP_API = "https://aisearchbyvoice.onrender.com/nlp/clean";

export async function searchFieldByAI(req, res) {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.status(400).json({ msg: "Missing query text" });
    }

    // 1. Gửi query sang AI NLP FastAPI
    const aiResponse = await axios.post(NLP_API, { text: query });

    const tokens = aiResponse.data.tokens;

    if (!tokens.length) {
      return res.json({ msg: "No keyword extracted", results: [] });
    }

    // 2. Tạo điều kiện tìm kiếm (LIKE %token%)
    const conditions = tokens.map(token => ({
      [Op.or]: [
        { name: { [Op.like]: `%${token}%` } },
        { location: { [Op.like]: `%${token}%` } },
        // giá tiền: nếu token là số thì so sánh gần đúng
        isNaN(token) ? {} : {
          price_per_hour: {
            [Op.between]: [
              Number(token) - 20000,
              Number(token) + 20000
            ]
          }
        }
      ]
    }));

    // 3. Gộp tất cả điều kiện bằng Op.and
    const results = await Field.findAll({
      where: {
        [Op.and]: conditions,
      },
    });

    res.json({
      query,
      tokens,
      total: results.length,
      results
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Lấy tất cả sân
 */
export async function getAllFields(req, res) {
  try {
    const fields = await Field.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(fields);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Lấy sân theo ID
 */
export async function getFieldById(req, res) {
  try {
    const { id } = req.params;

    const field = await Field.findByPk(id);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    res.json(field);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Tạo sân mới
 */
export async function createField(req, res) {
  try {
    const {
      name,
      location,
      price_per_hour,
      image_url,
      description,
    } = req.body;

    if (!name || !location || !price_per_hour) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Mặc định trạng thái luôn là "trống"
    const field = await Field.create({
      name,
      location,
      price_per_hour,
      image_url,
      description,
      status: "trống",
    });

    res.status(201).json({
      msg: "Field created successfully",
      field,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Cập nhật thông tin sân
 */
export async function updateField(req, res) {
  try {
    const { id } = req.params;

    const field = await Field.findByPk(id);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    // Chỉ cho update các trường sau:
    const allowedFields = [
      "name",
      "location",
      "price_per_hour",
      "image_url",
      "description",
    ];

    // Tạo object để update an toàn
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Tuyệt đối KHÔNG cho update status
    delete updates.status;

    await field.update(updates);

    res.json({
      msg: "Field updated successfully",
      field,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}


/**
 * Xóa sân
 */
export async function deleteField(req, res) {
  try {
    const { id } = req.params;

    const field = await Field.findByPk(id);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    await field.destroy();

    res.json({ msg: "Field deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Cập nhật trạng thái sân (chỉ "trống" / "đã thuê")
 */
export async function updateFieldStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["trống", "đã thuê"].includes(status)) {
      return res.status(400).json({
        msg: 'Status chỉ được là "trống" hoặc "đã thuê"',
      });
    }

    const field = await Field.findByPk(id);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    field.status = status;
    await field.save();

    res.json({
      msg: "Field status updated successfully",
      field,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Reset sân về "trống" + update booking thành cancelled
 */
export async function resetFieldStatus(req, res) {
  try {
    const { id } = req.params;

    const field = await Field.findByPk(id);
    if (!field) {
      return res.status(404).json({ msg: "Field not found" });
    }

    // 1. RESET TRẠNG THÁI SÂN
    field.status = "trống";
    await field.save();

    // 2. CHỈ UPDATE BOOKING, KHÔNG XÓA
    await Booking.update(
      { status: "cancelled" },
      { where: { field_id: id } }
    );

    return res.json({
      msg: "Field reset successfully. All bookings marked as cancelled."
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

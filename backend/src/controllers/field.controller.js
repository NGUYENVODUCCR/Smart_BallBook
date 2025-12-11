import Field from "../models/field.model.js";
import Booking from "../models/booking.model.js";

import axios from "axios";
import { Op } from "sequelize";

const NLP_API = "https://aisearchbyvoice.onrender.com/nlp/clean";

export async function searchFieldByAI(req, res) {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.status(400).json({ msg: "Missing query text" });
    }

    const aiResponse = await axios.post(NLP_API, { text: query });

    const tokens = aiResponse.data.tokens;

    if (!tokens.length) {
      return res.json({ msg: "No keyword extracted", results: [] });
    }

    const conditions = tokens.map(token => ({
      [Op.or]: [
        { name: { [Op.like]: `%${token}%` } },
        { location: { [Op.like]: `%${token}%` } },

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

export async function updateField(req, res) {
  try {
    const { id } = req.params;

    const field = await Field.findByPk(id);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    const allowedFields = [
      "name",
      "location",
      "price_per_hour",
      "image_url",
      "description",
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

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

export async function resetFieldStatus(req, res) {
  try {
    const { id } = req.params;

    const field = await Field.findByPk(id);
    if (!field) {
      return res.status(404).json({ msg: "Field not found" });
    }

    field.status = "trống";
    await field.save();

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

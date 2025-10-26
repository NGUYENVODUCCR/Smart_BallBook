import Field from "../models/field.model.js";

export async function getAllFields(req, res) {
  try {
    const fields = await Field.findAll();
    res.json(fields);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function getFieldById(req, res) {
  try {
    const field = await Field.findByPk(req.params.id);
    if (!field) return res.status(404).json({ msg: "Field not found" });
    res.json(field);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function createField(req, res) {
  try {
    const { name, location, price_per_hour, image_url, description } = req.body;
    if (!name || !location || !price_per_hour) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const field = await Field.create({ name, location, price_per_hour, image_url, description });
    res.status(201).json({ msg: "Field created", field });
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

    await field.update(req.body);
    res.json({ msg: "Field updated", field });
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
    res.json({ msg: "Field deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}
//
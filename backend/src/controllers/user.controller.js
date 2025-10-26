import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "is_active", "is_verified"],
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ["id", "name", "email", "role", "is_active", "is_verified"],
    });
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, is_active, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;

    if (password) {
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(password, salt);
    }

    await user.save();
    res.json({ msg: "User updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    await user.destroy();
    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.is_active = !user.is_active;
    await user.save();

    res.json({
      msg: `User ${user.is_active ? "unlocked" : "locked"}`,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}
//
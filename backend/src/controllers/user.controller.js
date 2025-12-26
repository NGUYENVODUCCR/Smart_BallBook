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

export async function createUser(req, res) {
  try {
    const { name, emailOrPhone, password, role } = req.body;

    if (!name || !emailOrPhone || !password || !role) {
      return res.status(400).json({ msg: "Thiếu thông tin bắt buộc" });
    }

    const exists = await User.findOne({ where: { email: emailOrPhone } });
    if (exists) return res.status(400).json({ msg: "Người dùng đã tồn tại" });

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = await User.create({
      name,
      email: emailOrPhone,
      password: hashedPassword,
      role,
      is_active: true,
      is_verified: true,
    });

    res.status(201).json({ msg: "User created", user: newUser });
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

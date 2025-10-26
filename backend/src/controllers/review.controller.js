import Review from "../models/review.model.js";
import Field from "../models/field.model.js";
import { Op } from "sequelize";

export async function getFieldReviews(req, res) {
  try {
    const { fieldId } = req.params;
    const reviews = await Review.findAll({
      where: { field_id: fieldId },
      include: ["user"],
      order: [["createdAt", "DESC"]],
    });

    const avg =
      reviews.length > 0
        ? (
            reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          ).toFixed(1)
        : 0;

    res.json({ reviews, averageRating: avg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function createReview(req, res) {
  try {
    const userId = req.user.id;
    const { field_id, rating, comment } = req.body;

    if (!field_id || !rating)
      return res.status(400).json({ msg: "Missing field_id or rating" });

    const existing = await Review.findOne({
      where: { user_id: userId, field_id },
    });
    if (existing)
      return res.status(400).json({ msg: "You already reviewed this field" });

    const review = await Review.create({
      user_id: userId,
      field_id,
      rating,
      comment,
    });

    res.status(201).json({ msg: "Review created", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function updateReview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ msg: "Review not found" });

    if (review.user_id !== userId)
      return res.status(403).json({ msg: "Not authorized" });

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    await review.save();

    res.json({ msg: "Review updated", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function deleteReview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ msg: "Review not found" });

    if (review.user_id !== userId && req.user.role !== "Admin")
      return res.status(403).json({ msg: "Not authorized" });

    await review.destroy();
    res.json({ msg: "Review deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

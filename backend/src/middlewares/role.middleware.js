export default function permit(...allowedRoles) {
  return (req, res, next) => {
    const { role } = req.user || {};
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ msg: "Forbidden: insufficient rights" });
    }
    next();
  };
}

export const isAdmin = (req, res, next) => {
  const { role } = req.user || {};
  if (role !== "Admin") {
    return res.status(403).json({ msg: "Forbidden: Admin only" });
  }
  next();
};

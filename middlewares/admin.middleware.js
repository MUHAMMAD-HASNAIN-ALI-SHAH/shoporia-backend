const adminMiddleware = (req, res, next) => {
  try {
    const user = req.session.user;

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    
    req.admin = user;

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = adminMiddleware;
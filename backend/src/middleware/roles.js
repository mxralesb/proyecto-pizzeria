export const requireRole = (...roles) => (req, res, next) => {
  const mainRole = String(req.user?.role || "").toLowerCase();
  const employeeRole = String(req.user?.employee_role || "").toLowerCase();
  const allowed = roles.map(r => String(r).toLowerCase());

  if (!allowed.includes(mainRole) && !allowed.includes(employeeRole)) {
    return res.status(403).json({ error: "Sin permisos" });
  }
  next();
};

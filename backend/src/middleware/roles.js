export const requireRole = (...roles) => (req, res, next) => {
  const userRole = req.user?.role;            
  const employeeRole = req.employee?.rol?.name; 
  const roleToCheck = userRole || employeeRole;

  if (!roleToCheck || !roles.includes(roleToCheck)) {
    return res.status(403).json({ error: "Sin permisos" });
  }
  next();
};

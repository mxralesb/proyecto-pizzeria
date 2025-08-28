import { Op } from "sequelize";
import { Employee } from "../../models/employee.js";
import { EmployeeRole } from "../../models/employeeRole.js";

export const listEmployeeRoles = async (req, res) => {
  try {
    const roles = await EmployeeRole.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    res.json(roles);
  } catch (err) {
    console.error("listEmployeeRoles:", err);
    res.status(500).json({ error: "No se pudieron obtener los roles" });
  }
};

export const listEmployees = async (req, res) => {
  try {
    const { q, role_id, active } = req.query;
    const where = {};

    if (q) {
      const like = { [Op.iLike]: `%${q}%` };
      where[Op.or] = [
        { cui: like },
        { primer_nombre: like },
        { segundo_nombre: like },
        { otros_nombres: like },
        { primer_apellido: like },
        { segundo_apellido: like },
      ];
    }
    if (role_id) where.rol_id = Number(role_id);
    if (active === "true" || active === "false") where.activo = active === "true";

    const data = await Employee.findAll({
      where,
      include: [{ model: EmployeeRole, as: "rol", attributes: ["id", "name"] }],
      order: [["primer_nombre", "ASC"]],
    });

    res.json(data);
  } catch (err) {
    console.error("listEmployees:", err);
    res.status(500).json({ error: "No se pudieron obtener los empleados" });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const {
      cui,
      primer_nombre,
      segundo_nombre,
      otros_nombres,
      primer_apellido,
      segundo_apellido,
      apellido_casado,
      telefono,
      telefono_emergencia,
      fecha_contratacion,
      salario,
      activo = true,
      rol_id,
    } = req.body;

    if (!cui || !primer_nombre || !primer_apellido || !telefono || !fecha_contratacion || !salario || !rol_id) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const exists = await Employee.findOne({ where: { cui } });
    if (exists) return res.status(409).json({ error: "El CUI ya existe" });

    const role = await EmployeeRole.findByPk(rol_id);
    if (!role) return res.status(400).json({ error: "Rol inválido" });

    const emp = await Employee.create({
      cui,
      primer_nombre,
      segundo_nombre,
      otros_nombres,
      primer_apellido,
      segundo_apellido,
      apellido_casado,
      telefono,
      telefono_emergencia,
      fecha_contratacion,
      salario,
      activo,
      rol_id,
    });

    const withRole = await Employee.findByPk(emp.id, {
      include: [{ model: EmployeeRole, as: "rol", attributes: ["id", "name"] }],
    });

    res.status(201).json(withRole);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "El CUI ya existe" });
    }
    console.error("createEmployee:", err);
    res.status(500).json({ error: "No se pudo crear el empleado" });
  }
};

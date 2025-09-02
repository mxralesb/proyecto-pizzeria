import bcrypt from "bcryptjs";
import { sequelize, Employee, EmployeeRole, User } from "../../models/index.js";

export async function listEmployees(req, res) {
  try {
    const { q, role_id, active } = req.query;
    const where = {};
    if (role_id) where.rol_id = Number(role_id);
    if (active === "true") where.activo = true;
    if (active === "false") where.activo = false;

    if (q && q.trim()) {
      const { Op } = await import("sequelize");
      const s = q.trim().toLowerCase();
      where[Op.or] = [
        sequelize.where(sequelize.fn("LOWER", sequelize.col("primer_nombre")), { [Op.like]: `%${s}%` }),
        sequelize.where(sequelize.fn("LOWER", sequelize.col("primer_apellido")), { [Op.like]: `%${s}%` }),
        sequelize.where(sequelize.col("cui"), { [Op.like]: `%${q}%` }),
      ];
    }

    const rows = await Employee.findAll({
      where,
      include: [{ model: EmployeeRole, as: "rol", attributes: ["id", "name"] }],
      order: [["id", "DESC"]],
    });

    const data = rows.map((r) => ({
      id: r.id,
      cui: r.cui ?? null,
      primer_nombre: r.primer_nombre,
      segundo_nombre: r.segundo_nombre,
      otros_nombres: r.otros_nombres,
      primer_apellido: r.primer_apellido,
      segundo_apellido: r.segundo_apellido,
      apellido_casado: r.apellido_casado,
      telefono: r.telefono,
      telefono_emergencia: r.telefono_emergencia,
      fecha_contratacion: r.fecha_contratacion,
      salario: r.salario,
      activo: r.activo,
      rol_id: r.rol_id,
      rol_name: r.rol?.name ?? null,
    }));

    res.json(data);
  } catch (err) {
    console.error("listEmployees error:", err);
    res.status(500).json({ error: "Error al listar empleados" });
  }
}

export async function listRoles(req, res) {
  try {
    const roles = await EmployeeRole.findAll({ order: [["id", "ASC"]] });
    res.json(roles);
  } catch (err) {
    console.error("listRoles error:", err);
    res.status(500).json({ error: "Error al listar roles" });
  }
}

export async function createEmployee(req, res) {
  const t = await sequelize.transaction();
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
      activo,
      rol_id,
      userEmail,
      userPassword,
      userRole,
    } = req.body;

    if (!primer_nombre || !primer_apellido || !telefono || !salario || !rol_id) {
      await t.rollback();
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const roleRow = await EmployeeRole.findByPk(Number(rol_id), { attributes: ["name"] });
    const employee_role = roleRow?.name?.toLowerCase() || null;

    let newUser = null;
    if (userEmail && userPassword && userRole) {
      const exists = await User.findOne({ where: { email: userEmail } });
      if (exists) {
        await t.rollback();
        return res.status(409).json({ error: "El correo ya está en uso" });
      }
      const hash = await bcrypt.hash(String(userPassword), 10);
      newUser = await User.create(
        {
          name: `${primer_nombre} ${primer_apellido}`.trim(),
          email: userEmail.toLowerCase(),
          password: hash,
          role: userRole,                  // "empleado"
          employee_role,                   // "mesero", "cocinero", etc.
        },
        { transaction: t }
      );
    }

    const emp = await Employee.create(
      {
        cui: cui ?? null,
        primer_nombre,
        segundo_nombre: segundo_nombre || null,
        otros_nombres: otros_nombres || null,
        primer_apellido,
        segundo_apellido: segundo_apellido || null,
        apellido_casado: apellido_casado || null,
        telefono,
        telefono_emergencia: telefono_emergencia || null,
        fecha_contratacion: fecha_contratacion || new Date(),
        salario: Number(salario),
        activo: typeof activo === "boolean" ? activo : true,
        rol_id: Number(rol_id),
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({ id: emp.id, user_id: newUser?.id ?? null });
  } catch (err) {
    console.error("createEmployee error:", err);
    await t.rollback();
    res.status(500).json({ error: "Error al crear empleado" });
  }
}

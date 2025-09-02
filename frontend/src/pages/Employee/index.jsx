import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import styles from "./Employee.module.css";
import Filters from "./components/Filters";
import Table from "./components/Table";
import ModalForm from "./components/ModalForm";

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    cui: "",
    primer_nombre: "",
    segundo_nombre: "",
    otros_nombres: "",
    primer_apellido: "",
    segundo_apellido: "",
    apellido_casado: "",
    telefono: "",
    telefono_emergencia: "",
    fecha_contratacion: new Date().toISOString().split("T")[0],
    salario: "",
    activo: true,
    rol_id: "",
    email: "",
    password: "",
  });

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/employees", {
        params: {
          q: search || undefined,
          role_id: roleFilter || undefined,
          active: statusFilter || undefined,
        },
      });
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/employees/roles");
      setRoles(data);
      await loadEmployees();
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => {
      const matches =
        e.cui?.includes(search) ||
        e.primer_nombre?.toLowerCase().includes(q) ||
        e.primer_apellido?.toLowerCase().includes(q);
      const roleOk = roleFilter ? e.rol_id === Number(roleFilter) : true;
      const statusOk = statusFilter === "" ? true : statusFilter === "true" ? e.activo : !e.activo;
      return matches && roleOk && statusOk;
    });
  }, [employees, search, roleFilter, statusFilter]);

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Empleados</h2>

      <Filters
        roles={roles}
        values={{ search, roleFilter, statusFilter }}
        onChange={{ setSearch, setRoleFilter, setStatusFilter }}
        onSearch={loadEmployees}
        onCreate={() => setShowForm(true)}
      />

      <Table data={filtered} loading={loading} />

      {showForm && (
        <ModalForm
          roles={roles}
          form={form}
          setForm={setForm}
          onClose={() => setShowForm(false)}
          onSaved={async () => {
            await loadEmployees();
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

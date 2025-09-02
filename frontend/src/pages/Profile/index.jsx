import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import s from "./Profile.module.css";
import {
  getMe,
  listDirecciones,
  createDireccion,
  updateDireccion,
  deleteDireccion,
  listTelefonos,
  createTelefono,
  updateTelefono,
  deleteTelefono,
} from "../../api/clientes";
import PhoneList from "./components/PhoneList";
import AddressList from "./components/AddressList";

export default function ProfilePage() {
  const [me, setMe] = useState(null);
  const [dirs, setDirs] = useState([]);
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const loadAll = async () => {
    setLoading(true);
    setErr("");
    try {
      const [meRes, dRes, pRes] = await Promise.all([
        getMe(),
        listDirecciones(),
        listTelefonos(),
      ]);
      setMe(meRes.data);
      setDirs(dRes.data);
      setPhones(pRes.data);
    } catch {
      setErr("No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateDir = async (payload) => {
    await createDireccion(payload);
    await loadAll();
  };
  const handleUpdateDir = async (id, payload) => {
    await updateDireccion(id, payload);
    await loadAll();
  };
  const handleDeleteDir = async (id) => {
    await deleteDireccion(id);
    await loadAll();
  };

  const handleCreatePhone = async (payload) => {
    await createTelefono(payload);
    await loadAll();
  };
  const handleUpdatePhone = async (id, payload) => {
    await updateTelefono(id, payload);
    await loadAll();
  };
  const handleDeletePhone = async (id) => {
    await deleteTelefono(id);
    await loadAll();
  };

  return (
    <div className="pz-container">
      <div className={s.headerRow}>
        <h2>Mi perfil</h2>
        <button
          className="pz-btn pz-btn-outline"
          onClick={() => navigate("/historial")}
          title="Ver historial de compras"
        >
          Ver historial de compras
        </button>
      </div>

      {loading && <p>Cargando…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && me && (
        <div className={s.grid}>
          <section className={s.card}>
            <h3>Datos básicos</h3>
            <p>
              <strong>Nombre:</strong> {me.nombre} {me.apellido}
            </p>
            <p>
              <strong>Correo:</strong> {me.correo_electronico}
            </p>
            <p>
              <strong>Registrado:</strong>{" "}
              {new Date(me.fecha_registro).toLocaleString()}
            </p>
          </section>

          <AddressList
            data={dirs}
            onCreate={handleCreateDir}
            onEdit={handleUpdateDir}
            onDelete={handleDeleteDir}
          />

          <PhoneList
            data={phones}
            onCreate={handleCreatePhone}
            onEdit={handleUpdatePhone}
            onDelete={handleDeletePhone}
          />
        </div>
      )}
    </div>
  );
}

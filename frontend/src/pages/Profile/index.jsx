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
    } catch (e) {
      console.error(e);
      setErr("No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ---------- Direcciones ----------
  const onAddDir = async () => {
    const tipo = prompt("Tipo de dirección (Casa/Oficina/Otro):", "Casa");
    if (tipo == null) return;
    const calle = prompt("Calle:");
    if (calle == null) return;
    const ciudad = prompt("Ciudad:");
    if (ciudad == null) return;
    const estado = prompt("Estado (opcional):", "");
    const cp = prompt("Código postal (opcional):", "");
    await createDireccion({
      tipo_direccion: tipo,
      calle,
      ciudad,
      estado,
      codigo_postal: cp,
    });
    await loadAll();
  };

  const onEditDir = async (d) => {
    const tipo = prompt("Tipo de dirección:", d.tipo_direccion);
    if (tipo == null) return;
    const calle = prompt("Calle:", d.calle);
    if (calle == null) return;
    const ciudad = prompt("Ciudad:", d.ciudad);
    if (ciudad == null) return;
    const estado = prompt("Estado:", d.estado ?? "");
    const cp = prompt("Código postal:", d.codigo_postal ?? "");
    await updateDireccion(d.id_direccion, {
      tipo_direccion: tipo,
      calle,
      ciudad,
      estado,
      codigo_postal: cp,
    });
    await loadAll();
  };

  const onDelDir = async (d) => {
    if (!confirm("¿Eliminar dirección?")) return;
    await deleteDireccion(d.id_direccion);
    await loadAll();
  };

  // ---------- Teléfonos ----------
  const onAddPhone = async () => {
    const numero = prompt("Número (20 máx):");
    if (numero == null) return;
    const tipo = prompt("Tipo (Movil/Casa/Trabajo):", "Movil");
    if (tipo == null) return;
    await createTelefono({ numero, tipo });
    await loadAll();
  };

  const onEditPhone = async (t) => {
    const numero = prompt("Número:", t.numero);
    if (numero == null) return;
    const tipo = prompt("Tipo:", t.tipo);
    if (tipo == null) return;
    await updateTelefono(t.id_telefono, { numero, tipo });
    await loadAll();
  };

  const onDelPhone = async (t) => {
    if (!confirm("¿Eliminar teléfono?")) return;
    await deleteTelefono(t.id_telefono);
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
          {/* Datos básicos */}
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
          <section className={s.card}>
            <div className={s.head}>
              <h3>Direcciones</h3>
              <button className="pz-btn pz-btn-outline" onClick={onAddDir}>
                + Agregar
              </button>
            </div>
            {dirs.length === 0 ? (
              <p className={s.empty}>Aún no tienes direcciones.</p>
            ) : (
              <ul className={s.list}>
                {dirs.map((d) => (
                  <li key={d.id_direccion} className={s.item}>
                    <div>
                      <div className={s.badge}>{d.tipo_direccion}</div>
                      <div>{d.calle}</div>
                      <small>
                        {d.ciudad}
                        {d.estado ? `, ${d.estado}` : ""} {d.codigo_postal || ""}
                      </small>
                    </div>
                    <div className={s.actions}>
                      <button
                        className="pz-btn pz-btn-ghost"
                        onClick={() => onEditDir(d)}
                      >
                        Editar
                      </button>
                      <button
                        className="pz-btn pz-btn-primary"
                        onClick={() => onDelDir(d)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Teléfonos */}
          <section className={s.card}>
            <div className={s.head}>
              <h3>Teléfonos</h3>
              <button className="pz-btn pz-btn-outline" onClick={onAddPhone}>
                + Agregar
              </button>
            </div>
            {phones.length === 0 ? (
              <p className={s.empty}>Aún no tienes teléfonos.</p>
            ) : (
              <ul className={s.list}>
                {phones.map((t) => (
                  <li key={t.id_telefono} className={s.item}>
                    <div>
                      <div className={s.badge}>{t.tipo}</div>
                      <div>{t.numero}</div>
                    </div>
                    <div className={s.actions}>
                      <button
                        className="pz-btn pz-btn-ghost"
                        onClick={() => onEditPhone(t)}
                      >
                        Editar
                      </button>
                      <button
                        className="pz-btn pz-btn-primary"
                        onClick={() => onDelPhone(t)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

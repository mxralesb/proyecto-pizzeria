import { useState } from "react";
import styles from "./AddressList.module.css";
import AddressModal from "./AddressModal";

export default function AddressList({ data, onCreate, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const openNew = () => {
    setCurrent(null);
    setOpen(true);
  };
  const openEdit = (row) => {
    setCurrent(row);
    setOpen(true);
  };
  const close = () => setOpen(false);

  const save = async (payload) => {
    if (current?.id_direccion) {
      await onEdit(current.id_direccion, payload);
    } else {
      await onCreate(payload);
    }
    setOpen(false);
  };

  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <h3>Direcciones</h3>
        <button className="pz-btn pz-btn-outline" onClick={openNew}>
          + Agregar
        </button>
      </div>

      {data.length === 0 ? (
        <p className={styles.empty}>Aún no tienes direcciones.</p>
      ) : (
        <ul className={styles.list}>
          {data.map((d) => (
            <li key={d.id_direccion} className={styles.item}>
              <div>
                <div className={styles.badge}>{d.tipo_direccion}</div>
                <div>{d.calle}</div>
                <small>
                  {d.ciudad}
                  {d.estado ? `, ${d.estado}` : ""} {d.codigo_postal || ""}
                </small>
              </div>
              <div className={styles.actions}>
                <button className="pz-btn pz-btn-ghost" onClick={() => openEdit(d)}>
                  Editar
                </button>
                <button
                  className="pz-btn pz-btn-primary"
                  onClick={() => onDelete(d.id_direccion)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <AddressModal current={current} onClose={close} onSave={save} />
      )}
    </section>
  );
}

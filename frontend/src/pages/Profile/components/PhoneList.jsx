import { useState } from "react";
import styles from "./PhoneList.module.css";
import PhoneModal from "./PhoneModal";

export default function PhoneList({ data, onCreate, onEdit, onDelete }) {
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
    if (current?.id_telefono) {
      await onEdit(current.id_telefono, payload);
    } else {
      await onCreate(payload);
    }
    setOpen(false);
  };

  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <h3>Teléfonos</h3>
        <button className="pz-btn pz-btn-outline" onClick={openNew}>
          + Agregar
        </button>
      </div>

      {data.length === 0 ? (
        <p className={styles.empty}>Aún no tienes teléfonos.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => (
              <tr key={t.id_telefono}>
                <td>{t.numero}</td>
                <td>{t.tipo}</td>
                <td className={styles.actions}>
                  <button className="pz-btn pz-btn-ghost" onClick={() => openEdit(t)}>
                    Editar
                  </button>
                  <button
                    className="pz-btn pz-btn-primary"
                    onClick={() => onDelete(t.id_telefono)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {open && (
        <PhoneModal current={current} onClose={close} onSave={save} />
      )}
    </section>
  );
}

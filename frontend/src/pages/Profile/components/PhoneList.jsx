import styles from "./PhoneList.module.css";

export default function PhoneList({ data, onCreate, onEdit, onDelete }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Teléfonos</h3>
        <button onClick={onCreate}>+ Agregar</button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr><th>Número</th><th>Tipo</th><th></th></tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={3} className={styles.empty}>Sin teléfonos</td></tr>
          ) : data.map(t => (
            <tr key={t.id_telefono}>
              <td>{t.numero}</td>
              <td>{t.tipo}</td>
              <td className={styles.actions}>
                <button onClick={()=>onEdit(t)}>Editar</button>
                <button className={styles.danger} onClick={()=>onDelete(t.id_telefono)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import styles from "./AddressList.module.css";

export default function AddressList({ data, onCreate, onEdit, onDelete }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Direcciones</h3>
        <button onClick={onCreate}>+ Agregar</button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tipo</th><th>Calle</th><th>Ciudad</th><th>Estado</th><th>CP</th><th></th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={6} className={styles.empty}>Sin direcciones</td></tr>
          ) : data.map(d => (
            <tr key={d.id_direccion}>
              <td>{d.tipo_direccion}</td>
              <td>{d.calle}</td>
              <td>{d.ciudad}</td>
              <td>{d.estado || ""}</td>
              <td>{d.codigo_postal || ""}</td>
              <td className={styles.actions}>
                <button onClick={()=>onEdit(d)}>Editar</button>
                <button className={styles.danger} onClick={()=>onDelete(d.id_direccion)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import styles from "./Table.module.css";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "");
const fmtMoney = (n) => (n != null ? `Q${Number(n).toFixed(2)}` : "");

export default function Table({ data, loading }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>CUI</th>
            <th>Primer Nombre</th>
            <th>Segundo Nombre</th>
            <th>Otros Nombres</th>
            <th>Primer Apellido</th>
            <th>Segundo Apellido</th>
            <th>Apellido Casado</th>
            <th>Teléfono</th>
            <th>Tel. Emergencia</th>
            <th>Fecha Contratación</th>
            <th>Salario</th>
            <th>Rol</th>
            <th>Activo</th>
            <th style={{width:140}}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={14} className={styles.center}>Cargando…</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={14} className={styles.center}>Sin resultados</td></tr>
          ) : (
            data.map((e) => (
              <tr key={e.id}>
                <td>{e.cui || "—"}</td>
                <td>{e.primer_nombre}</td>
                <td>{e.segundo_nombre || ""}</td>
                <td>{e.otros_nombres || ""}</td>
                <td>{e.primer_apellido}</td>
                <td>{e.segundo_apellido || ""}</td>
                <td>{e.apellido_casado || ""}</td>
                <td>{e.telefono}</td>
                <td>{e.telefono_emergencia || ""}</td>
                <td>{fmtDate(e.fecha_contratacion)}</td>
                <td className={styles.money}>{fmtMoney(e.salario)}</td>
                <td><span className={styles.badgeRole}>{e.rol?.name || ""}</span></td>
                <td>
                  <span className={`${styles.pill} ${e.activo ? styles.active : styles.inactive}`}>
                    {e.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={`${styles.btnSm} ${styles.primary}`}>Editar</button>
                    <button className={`${styles.btnSm} ${styles.danger}`}>{e.activo ? "Inactivar" : "Activar"}</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

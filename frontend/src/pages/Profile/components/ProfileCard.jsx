import styles from "./ProfileCard.module.css";

export default function ProfileCard({ me, onEdit, onDelete }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{me.nombre} {me.apellido}</h3>
        <div className={styles.actions}>
          <button onClick={onEdit}>Editar</button>
          <button className={styles.danger} onClick={onDelete}>Eliminar cuenta</button>
        </div>
      </div>
      <div className={styles.body}>
        <div><b>Correo:</b> {me.correo_electronico}</div>
        <div><b>Registrado:</b> {new Date(me.fecha_registro).toLocaleString()}</div>
      </div>
    </div>
  );
}

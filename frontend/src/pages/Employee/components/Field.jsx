import styles from "./Field.module.css";

export default function Field({ label, error, children }) {
  return (
    <div className={`${styles.field} ${error ? styles.hasError : ""}`}>
      <label>{label}</label>
      {children}
      {error && <small>{error}</small>}
    </div>
  );
}

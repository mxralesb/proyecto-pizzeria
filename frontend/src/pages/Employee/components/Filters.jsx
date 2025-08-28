import styles from "./Filters.module.css";

export default function Filters({ roles, values, onChange, onSearch, onCreate }) {
  const { search, roleFilter, statusFilter } = values;
  const { setSearch, setRoleFilter, setStatusFilter } = onChange;

  return (
    <div className={styles.filters}>
      <input
        className={styles.input}
        placeholder="Buscar por nombre o CUI…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
      />
      <select
        className={styles.select}
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
      >
        <option value="">Todos los roles</option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
      <select
        className={styles.select}
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">Todos</option>
        <option value="true">Activos</option>
        <option value="false">Inactivos</option>
      </select>
      <button className={styles.btn} onClick={onSearch}>Buscar</button>
      <button className={`${styles.btn} ${styles.primary}`} onClick={onCreate}>+ Crear</button>
    </div>
  );
}

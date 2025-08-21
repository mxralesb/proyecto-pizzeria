export default function Footer() {
  return (
    <footer className="pz-footer">
      <div className="pz-container pz-footer-grid">
        <div>
          <h4 className="pz-footer-title">El kratos</h4>
          <p>Auténtica pizza al horno de leña desde 1998.</p>
          <p className="pz-dim">© {new Date().getFullYear()} La Nonna. Todos los derechos reservados.</p>
        </div>

        <div>
          <h5 className="pz-footer-sub">Horarios</h5>
          <ul className="pz-list">
            <li>Lun–Jue: 11:00–22:00</li>
            <li>Vie–Sáb: 11:00–23:30</li>
            <li>Dom: 12:00–21:00</li>
          </ul>
        </div>

        <div>
          <h5 className="pz-footer-sub">Contacto</h5>
          <ul className="pz-list">
            <li>📍 Zona 10, Ciudad de Guatemala</li>
            <li>☎️ (502) 5555-1234</li>
            <li>✉️ pedidos@lannonna.gt</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

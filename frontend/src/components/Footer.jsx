export default function Footer() {
  return (
    <footer className="pz-footer">
      <div className="pz-container pz-footer-grid">
        <div>
          <h4 className="pz-footer-title">Pizzarica</h4>
          <p>Auténtica pizza al horno de leña desde 1998.</p>
          <p className="pz-dim"> {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>

        <div>
          <h5 className="pz-footer-sub">Horarios</h5>
          <ul className="pz-list">
            <li>Lun–Dom: 8:00–22:00</li>
          </ul>
        </div>

        <div>
          <h5 className="pz-footer-sub">Contacto</h5>
          <ul className="pz-list">
            <li> Zona 10, Ciudad de Guatemala</li>
            <li> (502) 5555-1234</li>
            <li> pedidos@pizza.gt</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

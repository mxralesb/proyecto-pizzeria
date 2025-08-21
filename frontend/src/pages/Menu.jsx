import { useEffect, useState } from "react";
import api from "../api/client";
import { useCart } from "../context/CartContext";

export default function Menu() {
  const [items,setItems]=useState([]);
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState(null);
  const [qty,setQty]=useState(1);
  const { add } = useCart();

  useEffect(()=>{ api.get("/menu").then(r=>setItems(r.data)); },[]);

  const openDetail=(item)=>{ setActive(item); setQty(1); setOpen(true); };
  const closeDetail=()=>{ setOpen(false); setActive(null); };

  return (
    <div className="pz-menu">
      <h2>Menú</h2>
      <div className="pz-grid">
        {items.map(i=>(
          <article key={i.id} className="pz-card" onClick={()=>openDetail(i)}>
            <div className="pz-card-media">
              <img src={i.image} alt={i.name}/>
              <span className="pz-chip">{i.category}</span>
            </div>
            <div className="pz-card-body">
              <h3>{i.name}</h3>
              <p className="pz-desc">{i.description}</p>
              <div className="pz-card-foot">
                <span className="pz-price">Q{i.price}</span>
                <button
                  className="pz-btn pz-btn-primary"
                  onClick={(e)=>{e.stopPropagation(); add(i,1);}}
                >
                  Agregar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {open && active && (
        <div className="pz-modal" onClick={closeDetail}>
          <div className="pz-modal-dialog" onClick={(e)=>e.stopPropagation()}>
            <button className="pz-modal-close" onClick={closeDetail}>✕</button>
            <img className="pz-modal-img" src={active.image} alt={active.name}/>
            <div className="pz-modal-body">
              <h3 className="pz-modal-title">{active.name}</h3>
              <p className="pz-modal-text">{active.description}</p>
              <div className="pz-modal-actions">
                <span className="pz-price-lg">Q{active.price}</span>
                <div className="pz-qty">
                  <button onClick={()=>setQty(q=>Math.max(1,q-1))}>-</button>
                  <input value={qty} onChange={e=>setQty(Math.max(1, Number(e.target.value)||1))}/>
                  <button onClick={()=>setQty(q=>q+1)}>+</button>
                </div>
                <button className="pz-btn pz-btn-primary" onClick={()=>{ add(active, qty); closeDetail(); }}>Agregar al carrito</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

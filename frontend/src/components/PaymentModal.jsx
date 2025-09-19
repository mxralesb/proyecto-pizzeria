import { useState } from "react";
import styles from "./PaymentModal.module.css";

export default function PaymentModal({ open, onClose, onConfirm, total }) {
  const [amount, setAmount] = useState(total);

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Cobro de Mesa</h3>
        <p>Total a pagar: <strong>Q{Number(total).toFixed(2)}</strong></p>

        <div className={styles.formRow}>
          <label>Monto recibido</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.btnGhost} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.btnPrimary}
            onClick={() => {
              if (!amount) return;
              onConfirm(Number(amount));
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

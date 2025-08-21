import { useCart } from "../context/CartContext";

export default function Toast() {
  const { flash } = useCart();
  return (
    <div className={`pz-toast ${flash ? "show" : ""}`}>
      {flash}
    </div>
  );
}

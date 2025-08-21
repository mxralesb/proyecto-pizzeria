import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/authContext";
import { CartProvider } from "./context/CartContext";
import Layout from "./components/Layout";
import CartPanel from "./components/CartPanel";
import CartFab from "./components/CartFab";
import Toast from "./components/Toast";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Recover from "./pages/Recover";
import Reserve from "./pages/Reserve";
import MyReservations from "./pages/MyReservations";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Menu />} />
              <Route path="/reservar" element={<Reserve />} />
              <Route path="/login" element={<Login />} />
              <Route path="/recuperar" element={<Recover />} />
              <Route path="/mis-reservas" element={<MyReservations/>} />
            </Routes>
            <CartPanel />
            <CartFab />
            <Toast />
          </Layout>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
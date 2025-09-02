// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthProvider from "./context/authContext";
import { CartProvider } from "./context/CartContext";

import Layout from "./components/Layout";
import CartPanel from "./components/CartPanel";
import CartFab from "./components/CartFab";
import Toast from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Recover from "./pages/Recover";
import Reserve from "./pages/Reserve";
import MyReservations from "./pages/MyReservations";
import Employee from "./pages/Employee";
import Orders from "./pages/Orders";
import Delivery from "./pages/Delivery";
import AddEmployee from "./pages/AddEmployee.jsx";
import ProfilePage from "./pages/Profile";
import RegisterClient from "./pages/Auth/RegisterClient";
import CheckoutPage from "./pages/Checkout";
import History from "./pages/History"; // <- asegúrate de tener src/pages/History/index.jsx con export default
import Inventory from "./pages/Inventory.jsx";
// Guards
import RequireAdmin from "./components/RequireAdmin";
import RequireClient from "./components/RequireClient";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout>
            <ErrorBoundary>
              <Routes>
                {/* Públicas */}
                <Route path="/" element={<Menu />} />
                <Route path="/reservar" element={<Reserve />} />
                <Route path="/login" element={<Login />} />
                <Route path="/recuperar" element={<Recover />} />
                <Route path="/registro" element={<RegisterClient />} />
                <Route path="/checkout" element={<CheckoutPage />} />

                {/* Cliente */}
                <Route
                  path="/perfil"
                  element={
                    <RequireClient>
                      <ProfilePage />
                    </RequireClient>
                  }
                />
                <Route
                  path="/mis-reservas"
                  element={
                    <RequireClient>
                      <MyReservations />
                    </RequireClient>
                  }
                />
                <Route
                  path="/historial"
                  element={
                    <RequireClient>
                      <History />
                    </RequireClient>
                  }
                />
                {/* Admin */}
                <Route
                  path="/empleados"
                  element={
                    <RequireAdmin>
                      <Employee />
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/employees/new"
                  element={
                    <RequireAdmin>
                      <AddEmployee />
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <RequireAdmin>
                      <Orders />
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/delivery"
                  element={
                    <RequireAdmin>
                      <Delivery />
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/inventory"   // ✅ nueva ruta protegida
                  element={
                    <RequireAdmin>
                      <Inventory />
                    </RequireAdmin>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>

            {/* UI global persistente */}
            <CartPanel />
            <CartFab />
            <Toast />
          </Layout>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

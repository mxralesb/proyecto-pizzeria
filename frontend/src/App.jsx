import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthProvider from "./context/authContext";
import { CartProvider } from "./context/CartContext";

import Layout from "./components/Layout";
import CartPanel from "./components/CartPanel";
import CartFab from "./components/CartFab";
import Toast from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";

import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Recover from "./pages/Recover";
import Employee from "./pages/Employee";
import Orders from "./pages/Orders";
import Delivery from "./pages/Delivery";
import AddEmployee from "./pages/AddEmployee.jsx";
import ProfilePage from "./pages/Profile";
import RegisterClient from "./pages/Auth/RegisterClient";
import CheckoutPage from "./pages/Checkout";
import History from "./pages/History";
import Inventory from "./pages/Inventory.jsx";
import GoogleAuth from "./pages/OAuth/GoogleAuth";
import MesasDashboard from "./pages/Mesas";
import POSPage from "./pages/POS";
import OrdersOpsBoard from "./pages/ops/Orders";
import CourierDashboard from "./pages/Courier";
import RequireAdmin from "./components/RequireAdmin";
import RequireClient from "./components/RequireClient";
import RequireRole from "./components/RequireRole";
import ChargesPage from "./pages/Charges";
import RequireAdminOrClient from "./components/RequireAdminOrClient";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout>
            <ErrorBoundary>
              <Routes>
                <Route
                  path="/"
                  element={
                    <RequireAdminOrClient>
                      <Menu />
                    </RequireAdminOrClient>
                  }
                />

                <Route path="/login" element={<Login />} />
                <Route path="/recuperar" element={<Recover />} />
                <Route path="/registro" element={<RegisterClient />} />
                <Route path="/oauth/google" element={<GoogleAuth />} />
                <Route path="/checkout" element={<CheckoutPage />} />

                <Route
                  path="/perfil"
                  element={
                    <RequireClient>
                      <ProfilePage />
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
                  path="/inventory"
                  element={
                    <RequireAdmin>
                      <Inventory />
                    </RequireAdmin>
                  }
                />

                <Route
                  path="/mesas"
                  element={
                    <RequireRole roles={["mesero"]}>
                      <MesasDashboard />
                    </RequireRole>
                  }
                />

                <Route
                  path="/ops/pos"
                  element={
                    <RequireRole roles={["mesero"]}>
                      <POSPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/pos"
                  element={
                    <RequireRole roles={["mesero"]}>
                      <POSPage />
                    </RequireRole>
                  }
                />

                <Route
                  path="/ops/pedidos"
                  element={
                    <RequireRole roles={["mesero", "cocinero", "repartidor"]}>
                      <OrdersOpsBoard />
                    </RequireRole>
                  }
                />

                <Route
                  path="/repartos"
                  element={
                    <RequireRole roles={["repartidor"]}>
                      <CourierDashboard />
                    </RequireRole>
                  }
                />

                <Route
                  path="/cobros"
                  element={
                    <RequireRole roles={["mesero"]}>
                      <ChargesPage />
                    </RequireRole>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>

            <CartPanel />
            <CartFab />
            <Toast />
          </Layout>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

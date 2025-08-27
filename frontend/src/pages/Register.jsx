import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
  });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await axios.post("http://localhost:4000/api/auth/register", form);
      navigate("/login"); // ✅ Redirige a login después de registrarse
    } catch (error) {
      setErr(error.response?.data?.error || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pz-auth">
      <div className="pz-card-auth">
        <div className="pz-auth-head">
          <span className="pz-logo"></span>
          <div>
            <h3>Crear cuenta</h3>
            <p>Llena el formulario para registrarte</p>
          </div>
        </div>

        {err && <div className="pz-alert">{err}</div>}

        <form onSubmit={handleSubmit} className="pz-form">
          <label>
            <span>Correo</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Contraseña</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Primer nombre</span>
            <input
              type="text"
              name="primer_nombre"
              value={form.primer_nombre}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Segundo nombre</span>
            <input
              type="text"
              name="segundo_nombre"
              value={form.segundo_nombre}
              onChange={handleChange}
            />
          </label>

          <label>
            <span>Primer apellido</span>
            <input
              type="text"
              name="primer_apellido"
              value={form.primer_apellido}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Segundo apellido</span>
            <input
              type="text"
              name="segundo_apellido"
              value={form.segundo_apellido}
              onChange={handleChange}
            />
          </label>

          <button
            className="pz-btn pz-btn-primary pz-btn-block"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="pz-auth-foot">
          <span>¿Ya tienes cuenta?</span>
          <Link to="/login" className="pz-link-minor">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
export function recoverEmailHtml({ name, tempPassword, supportEmail }) {
  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:auto;padding:16px">
    <h2 style="margin:0 0 8px">Hola, ${name} 🍕</h2>
    <p>Generamos una <strong>contraseña temporal</strong> para tu cuenta.</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin:16px 0">
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px">Contraseña temporal</div>
      <div style="font-size:20px;font-weight:800;letter-spacing:1px">${tempPassword}</div>
    </div>
    <p>Inicia sesión y cámbiala desde tu perfil lo antes posible.</p>
    <p style="color:#6b7280;font-size:12px;margin-top:24px">
      ¿No fuiste tú? Escríbenos a <a href="mailto:${supportEmail}">${supportEmail}</a>.
    </p>
  </div>`;
}

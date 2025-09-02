const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error("No se pudo cargar Google Identity"));
    document.head.appendChild(s);
  });

export async function googleSignInAndGetIdToken() {
  await loadGoogleScript();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("VITE_GOOGLE_CLIENT_ID no está definido");

  return new Promise((resolve, reject) => {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (resp) => {
        if (resp?.credential) resolve({ idToken: resp.credential });
        else reject(new Error("Sin credencial de Google"));
      },
      auto_select: false,
      ux_mode: "popup",
    });
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const btn = document.createElement("div");
        window.google.accounts.id.renderButton(btn, { theme: "outline", size: "large" });
        const click = () => {
          btn.querySelector("div[role=button]")?.click();
          btn.remove();
        };
        document.body.appendChild(btn);
        click();
      }
    });
  });
}

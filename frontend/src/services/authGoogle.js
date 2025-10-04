// frontend/src/services/authGoogle.js
const GSI_SRC = "https://accounts.google.com/gsi/client";

function loadGsiScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts?.id) return resolve();
    const exists = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (exists) {
      exists.addEventListener("load", () => resolve());
      exists.addEventListener("error", () => reject(new Error("No se pudo cargar GSI")));
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar GSI"));
    document.head.appendChild(s);
  });
}


export async function googleSignInAndGetIdToken() {
  await loadGsiScript();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("Falta VITE_GOOGLE_CLIENT_ID en el .env del frontend");
  }

  return new Promise((resolve, reject) => {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => {
          const idToken = resp?.credential;
          if (idToken) return resolve({ idToken });
          reject(new Error("No se recibió credential de Google"));
        },
        // Si quieres forzar popup en vez de onetap:
        // ux_mode: 'popup',
      });

      // Dispara el prompt de One Tap / popup
      window.google.accounts.id.prompt((notification) => {
        // Si el usuario cierra el prompt o hay error
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
           // window.google.accounts.id.prompt();
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

import "dotenv/config";
import { sendMail } from "../src/utils/mailer.js";

const main = async ()=>{
  const r = await sendMail({
    to: "seminarioclaves220@gmail.com",
    subject: "Prueba Brevo API",
    html: "<p>Hola</p>"
  });
  console.log("ENVIADO API:", r?.messageId || "OK");
};
main().catch(console.error);

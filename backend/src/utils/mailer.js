import "dotenv/config";
import SibApiV3Sdk from "@sendinblue/client";

const brevo = new SibApiV3Sdk.TransactionalEmailsApi();
brevo.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export async function sendMail({ to, subject, html }) {
  return brevo.sendTransacEmail({
    sender: { email: /<(.+)>/.exec(process.env.FROM_EMAIL)?.[1] || "no-reply@pizzeria.gt", name: "Pizzeria" },
    to: [{ email: to }],
    subject,
    htmlContent: html
  });
}

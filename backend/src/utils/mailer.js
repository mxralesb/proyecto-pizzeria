import "dotenv/config";
import SibApiV3Sdk from "sib-api-v3-sdk";

const brevo = SibApiV3Sdk.ApiClient.instance;
const apiKey = brevo.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const txApi = new SibApiV3Sdk.TransactionalEmailsApi();

const FROM_RAW = process.env.FROM_EMAIL || '"Pizzería" <no-reply@pizzeriagt.test>';
const FROM_EMAIL = /<([^>]+)>/.exec(FROM_RAW)?.[1] || "no-reply@pizzeriagt.test";
const FROM_NAME = /"([^"]+)"/.exec(FROM_RAW)?.[1] || "Pizzería";

export async function sendMail(to, subject, html) {
  const email = new SibApiV3Sdk.SendSmtpEmail();
  email.sender = { email: FROM_EMAIL, name: FROM_NAME };
  email.to = [{ email: to }];
  email.subject = subject;
  email.htmlContent = html;
  return txApi.sendTransacEmail(email);
}

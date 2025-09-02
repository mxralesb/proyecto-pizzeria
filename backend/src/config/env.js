import 'dotenv/config';

function required(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`[ENV] Falta la variable ${name} en el backend/.env`);
    process.exit(1);
  }
  return v;
}

export const env = {
  PORT: Number(process.env.PORT || 4000),
  JWT_SECRET: required('JWT_SECRET'),
  GOOGLE_CLIENT_ID: required('GOOGLE_CLIENT_ID'),

};

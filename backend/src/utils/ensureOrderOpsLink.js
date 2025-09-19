import { sequelize } from "../models/index.js";

export async function ensureOrderOpsLink() {
  const [r] = await sequelize.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema='public' AND table_name LIKE '%order%';
  `);
  const guess = (r?.[0]?.table_name) || "orders";
  const table = `"public"."${guess}"`;

  await sequelize.query(`
    ALTER TABLE ${table}
      ADD COLUMN IF NOT EXISTS ops_order_id integer,
      ADD COLUMN IF NOT EXISTS ops_order_number varchar(32);
  `);

  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_${guess}_ops_order_id
    ON ${table}(ops_order_id);
  `);
}

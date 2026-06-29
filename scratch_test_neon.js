const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const connectionString = "postgresql://neondb_owner:npg_Lb9ZftFpOgn6@ep-crimson-mountain-atl0ub2g-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";

try {
  console.log("Creating Pool...");
  const pool = new Pool({ connectionString });
  console.log("Pool created successfully!");
  
  console.log("Running test query...");
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error("Query failed:", err);
    } else {
      console.log("Query succeeded! Result:", res.rows[0]);
    }
    pool.end();
  });
} catch (e) {
  console.error("Constructor failed:", e);
}

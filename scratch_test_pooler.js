const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

// The pooled connection string that fails
const connectionString = "postgresql://neondb_owner:npg_Lb9ZftFpOgn6@ep-crimson-mountain-atl0ub2g-pooler.c-9.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

try {
  console.log("Creating Pool...");
  const pool = new Pool({ connectionString });
  console.log("Pool created successfully!");
  
  console.log("Running test query...");
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error("Query failed with expected error:", err.message || err);
    } else {
      console.log("Query succeeded! Result:", res.rows[0]);
    }
    pool.end();
  });
} catch (e) {
  console.error("Constructor failed:", e);
}

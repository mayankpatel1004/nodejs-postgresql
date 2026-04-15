const db = require('../db/connection');
const util = require("util");
const query = util.promisify(db.query).bind(db);

async function migrate() {
  try {
    // Table: items
    try {
      let sqlQuery = `DROP DATABASE IF EXISTS Demonstration`;
      await query(sqlQuery);
      console.log("✅ All Database dropped successfully");
    } catch (err) {
      console.error("❌ Failed to drop Database :", err.message);
    }
    await db.end();
    process.exit();
  } catch (err) {
    console.error("\n❌ Drop Database failed with fatal error:", err);
    await db.end();
    process.exit(1);
  }
}

migrate();
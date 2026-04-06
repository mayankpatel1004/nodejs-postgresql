const db = require('../db/connection');
const util = require("util");
const query = util.promisify(db.query).bind(db);

async function migrate() {
  try {
    // Table: items
    try {
      let sqlQuery = `DROP TABLE IF EXISTS 
      items,
      item_section,
      item_section_relation,
      meta_details,
      role,
      role_access,
      site_config,
      site_config_parent,
      users,
      customers,
      ec_cart,
      ec_cart_product,
      ec_cashback_credit_transaction,
      ec_cashback_transaction,
      ec_closeday,
      ec_coupon,
      ec_order,
      ec_order_payment_details,
      ec_order_products,
      ec_order_products_return,
      ec_order_products_return_logs,
      ec_order_status,
      ec_products,
      ec_product_price,
      ec_product_price_log,
      ec_product_reviews,
      ec_product_specifications,
      ec_search_terms,
      ec_search_terms_logs,
      ec_wishlist
      CASCADE`;
      await query(sqlQuery);
      console.log("✅ All tables dropped successfully");
    } catch (err) {
      console.error("❌ Failed to drop table :", err.message);
    }
    await db.end();
    process.exit();
  } catch (err) {
    console.error("\n❌ Drop tables failed with fatal error:", err);
    await db.end();
    process.exit(1);
  }
}

migrate();
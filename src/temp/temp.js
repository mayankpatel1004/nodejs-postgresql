// migrate.js
// Run this script from command line: node migrate.js

const { Pool } = require('pg');

// Configure PostgreSQL connection (adjust credentials as needed)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'your_database',
  user: process.env.DB_USER || 'your_user',
  password: process.env.DB_PASSWORD || 'your_password',
});

async function query(sql) {
  const client = await pool.connect();
  try {
    await client.query(sql);
  } finally {
    client.release();
  }
}

async function migrate() {
  console.log('--- Starting Migration ---\n');

  // Helper to execute SQL and log success/failure
  async function run(sql, successMsg, errorMsg) {
    try {
      await query(sql);
      console.log(`✅ ${successMsg}`);
    } catch (err) {
      // For ALTER TABLE ADD COLUMN, ignore "column already exists" errors
      if (errorMsg.includes('add_1') && err.code === '42701') {
        console.log(`ℹ️ Column 'add_1' already exists in 'users' table`);
        return;
      }
      console.error(`❌ ${errorMsg}: ${err.message}`);
    }
  }

  // 1. Table: items
  await run(
    `
    CREATE TABLE IF NOT EXISTS items (
      item_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      site_id INTEGER NOT NULL DEFAULT 0,
      item_title VARCHAR(255) DEFAULT NULL,
      item_alias VARCHAR(255) DEFAULT NULL,
      item_parent INTEGER NOT NULL DEFAULT 0,
      item_type VARCHAR(255) DEFAULT NULL,
      item_sections_id VARCHAR(255) DEFAULT NULL,
      item_description TEXT DEFAULT NULL,
      attachment1 VARCHAR(255) DEFAULT NULL,
      attachment2 VARCHAR(255) DEFAULT NULL,
      item_shortdescription TEXT DEFAULT NULL,
      user_id INTEGER NOT NULL DEFAULT 0,
      controller VARCHAR(50) DEFAULT NULL,
      action VARCHAR(50) DEFAULT 'index',
      published_at DATE DEFAULT NULL,
      published_end_at DATE DEFAULT NULL,
      meta_title VARCHAR(255) DEFAULT NULL,
      meta_description TEXT DEFAULT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
      created_by INTEGER NOT NULL DEFAULT 0,
      created_by_name VARCHAR(255) DEFAULT NULL,
      created_by_role INTEGER NOT NULL DEFAULT 0,
      deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
      deleted_by INTEGER NOT NULL DEFAULT 0,
      deleted_by_name VARCHAR(255) DEFAULT NULL,
      deleted_time TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `,
    "Table 'items' created successfully",
    "Failed to create table 'items'"
  );

  // 2. Table: action
  await run(
    `
    CREATE TABLE IF NOT EXISTS action (
      action_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      action VARCHAR(255) DEFAULT NULL,
      record_id INTEGER NOT NULL DEFAULT 0,
      table_name VARCHAR(255) DEFAULT NULL,
      record_name VARCHAR(255) DEFAULT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
      created_by INTEGER NOT NULL DEFAULT 0,
      created_by_name VARCHAR(255) DEFAULT NULL,
      created_by_role INTEGER NOT NULL DEFAULT 0,
      deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
      deleted_by INTEGER NOT NULL DEFAULT 0,
      deleted_by_name VARCHAR(255) DEFAULT NULL,
      deleted_time TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `,
    "Table 'action' created successfully",
    "Failed to create table 'action'"
  );

  // 3. Table: item_section
  await run(
    `
    CREATE TABLE IF NOT EXISTS item_section (
      item_section_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      site_id INTEGER NOT NULL DEFAULT 0,
      item_section_parent_id INTEGER NOT NULL DEFAULT 0,
      section_title VARCHAR(255) DEFAULT NULL,
      section_alias VARCHAR(255) DEFAULT NULL,
      item_type VARCHAR(255) DEFAULT NULL,
      description TEXT DEFAULT NULL,
      attachment1 VARCHAR(255) DEFAULT NULL,
      user_id INTEGER DEFAULT 0,
      meta_title VARCHAR(255) DEFAULT NULL,
      meta_description TEXT DEFAULT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
      created_by INTEGER NOT NULL DEFAULT 0,
      created_by_name VARCHAR(255) DEFAULT NULL,
      created_by_role INTEGER NOT NULL DEFAULT 0,
      deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
      deleted_by INTEGER NOT NULL DEFAULT 0,
      deleted_by_name VARCHAR(255) DEFAULT NULL,
      deleted_time TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `,
    "Table 'item_section' created successfully",
    "Failed to create table 'item_section'"
  );

  // 4. Table: item_section_relation
  await run(
    `
    CREATE TABLE IF NOT EXISTS item_section_relation (
      item_section_relation_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      site_id INTEGER NOT NULL DEFAULT 0,
      item_id BIGINT NOT NULL DEFAULT 0,
      section_id BIGINT NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
      created_by INTEGER NOT NULL DEFAULT 0,
      created_by_name VARCHAR(255) DEFAULT NULL,
      created_by_role INTEGER NOT NULL DEFAULT 0,
      deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
      deleted_by INTEGER NOT NULL DEFAULT 0,
      deleted_by_name VARCHAR(255) DEFAULT NULL,
      deleted_time TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `,
    "Table 'item_section_relation' created successfully",
    "Failed to create table 'item_section_relation'"
  );

  // 5. Table: meta_details
  await run(
    `
    CREATE TABLE IF NOT EXISTS meta_details (
      meta_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      site_id INTEGER NOT NULL DEFAULT 0,
      parent_id INTEGER NOT NULL DEFAULT 0,
      end_points VARCHAR(255) DEFAULT NULL,
      page_title VARCHAR(255) DEFAULT NULL,
      meta_title VARCHAR(255) DEFAULT NULL,
      meta_description VARCHAR(255) DEFAULT NULL,
      sidebar_title VARCHAR(255) DEFAULT NULL,
      sidebar_icon VARCHAR(255) DEFAULT NULL,
      sidebar_order INTEGER NOT NULL DEFAULT 0,
      params VARCHAR(255) DEFAULT NULL,
      is_module SMALLINT NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
      created_by INTEGER NOT NULL DEFAULT 0,
      created_by_name VARCHAR(255) DEFAULT NULL,
      created_by_role INTEGER NOT NULL DEFAULT 0,
      deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
      deleted_by INTEGER NOT NULL DEFAULT 0,
      deleted_by_name VARCHAR(255) DEFAULT NULL,
      deleted_time TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `,
    "Table 'meta_details' created successfully",
    "Failed to create table 'meta_details'"
  );

  // 6. Table: role
  await run(
    `
    CREATE TABLE IF NOT EXISTS role (
      role_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      site_id INTEGER NOT NULL DEFAULT 0,
      role_title VARCHAR(255) DEFAULT NULL,
      item_alias VARCHAR(255) DEFAULT NULL,
      item_type VARCHAR(255) NOT NULL DEFAULT 'role',
      display_on_listing VARCHAR(1) NOT NULL DEFAULT 'Y',
      show_action_checkbox VARCHAR(1) NOT NULL DEFAULT 'Y',
      allow_delete VARCHAR(1) NOT NULL DEFAULT 'Y',
      display_order INTEGER NOT NULL DEFAULT 0,
      display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
      created_by INTEGER NOT NULL DEFAULT 0,
      created_by_name VARCHAR(255) DEFAULT NULL,
      created_by_role INTEGER NOT NULL DEFAULT 0,
      deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
      deleted_by INTEGER NOT NULL DEFAULT 0,
      deleted_by_name VARCHAR(255) DEFAULT NULL,
      deleted_time TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `,
    "Table 'role' created successfully",
    "Failed to create table 'role'"
  );

  // 7. Table: role_access
  await run(
    `
    CREATE TABLE IF NOT EXISTS role_access (
      role_access_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      site_id INTEGER NOT NULL DEFAULT 0,
      role_id INTEGER DEFAULT 0,
      module_id INTEGER DEFAULT 0,
      grant_add VARCHAR(1) NOT NULL DEFAULT 'N',
      grant_edit VARCHAR(1) NOT NULL DEFAULT 'N',
      grant_delete VARCHAR(1) NOT NULL DEFAULT 'N',
      grant_view VARCHAR(1) NOT NULL DEFAULT 'N',
      display_order INTEGER NOT NULL DEFAULT 0,
      display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
      created_by INTEGER NOT NULL DEFAULT 0,
      created_by_name VARCHAR(255) DEFAULT NULL,
      created_by_role INTEGER NOT NULL DEFAULT 0,
      deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
      deleted_by INTEGER NOT NULL DEFAULT 0,
      deleted_by_name VARCHAR(255) DEFAULT NULL,
      deleted_time TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `,
    "Table 'role_access' created successfully",
    "Failed to create table 'role_access'"
  );

  // 8. Table: site_config
  await run(
    `
    CREATE TABLE IF NOT EXISTS site_config (
      config_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      site_id INTEGER NOT NULL DEFAULT 0,
      config_title VARCHAR(1024) DEFAULT NULL,
      config_name VARCHAR(1024) DEFAULT NULL,
      config_value TEXT DEFAULT NULL,
      input_type VARCHAR(15) DEFAULT NULL,
      size INTEGER NOT NULL DEFAULT 100,
      maxlength INTEGER NOT NULL DEFAULT 100,
      input_type_title VARCHAR(100) DEFAULT NULL,
      classname VARCHAR(100) DEFAULT 'textbox',
      required VARCHAR(1) DEFAULT 'O',
      comments VARCHAR(255) DEFAULT NULL,
      additional VARCHAR(100) DEFAULT NULL,
      display_on_dashboard VARCHAR(1) NOT NULL DEFAULT 'N',
      display_on_third_party VARCHAR(1) NOT NULL DEFAULT 'N',
      site_config_parent_id SMALLINT NOT NULL DEFAULT 0,
      root_user_only VARCHAR(1) NOT NULL DEFAULT 'N',
      display_order INTEGER NOT NULL DEFAULT 0,
      display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
      created_by INTEGER NOT NULL DEFAULT 0,
      created_by_name VARCHAR(255) DEFAULT NULL,
      created_by_role INTEGER NOT NULL DEFAULT 0,
      deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
      deleted_by INTEGER NOT NULL DEFAULT 0,
      deleted_by_name VARCHAR(255) DEFAULT NULL,
      deleted_time TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `,
    "Table 'site_config' created successfully",
    "Failed to create table 'site_config'"
  );

  // 9. Table: site_config_parent
  await run(
    `
    CREATE TABLE IF NOT EXISTS site_config_parent (
      site_config_parent_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      site_id INTEGER NOT NULL,
      site_config_title VARCHAR(191) NOT NULL,
      classname VARCHAR(191) NOT NULL,
      root_user_only VARCHAR(1) NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
      created_by INTEGER NOT NULL DEFAULT 0,
      created_by_name VARCHAR(255) DEFAULT NULL,
      created_by_role INTEGER NOT NULL DEFAULT 0,
      deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
      deleted_by INTEGER NOT NULL DEFAULT 0,
      deleted_by_name VARCHAR(255) DEFAULT NULL,
      deleted_time TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `,
    "Table 'site_config_parent' created successfully",
    "Failed to create table 'site_config_parent'"
  );

  // 10. Table: users
  await run(
    `
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      site_id INTEGER NOT NULL DEFAULT 0,
      site_db VARCHAR(255) DEFAULT NULL,
      user_firstname VARCHAR(255) DEFAULT NULL,
      user_lastname VARCHAR(255) DEFAULT NULL,
      user_name VARCHAR(255) DEFAULT NULL,
      user_email VARCHAR(255) DEFAULT NULL,
      user_password VARCHAR(255) DEFAULT NULL,
      user_token VARCHAR(255) DEFAULT NULL,
      user_photo VARCHAR(255) DEFAULT NULL,
      user_role_id SMALLINT NOT NULL DEFAULT 0,
      is_developer_account VARCHAR(1) NOT NULL DEFAULT 'N',
      allow_delete VARCHAR(1) NOT NULL DEFAULT 'Y',
      web_or_app VARCHAR(4) NOT NULL DEFAULT 'App',
      active_status VARCHAR(25) NOT NULL DEFAULT 'N',
      display_order INTEGER NOT NULL DEFAULT 0,
      display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
      created_by INTEGER NOT NULL DEFAULT 0,
      created_by_name VARCHAR(255) DEFAULT NULL,
      created_by_role INTEGER NOT NULL DEFAULT 0,
      deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
      deleted_by INTEGER NOT NULL DEFAULT 0,
      deleted_by_name VARCHAR(255) DEFAULT NULL,
      deleted_time TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `,
    "Table 'users' created successfully",
    "Failed to create table 'users'"
  );

  // 11. Add column add_1 to users (if not exists)
  await run(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS add_1 VARCHAR(255) DEFAULT NULL`,
    "Column 'add_1' added to 'users' table successfully",
    "Failed to add column 'add_1' to 'users' table"
  );

  // 12. Table: customers
  await run(
    `
    CREATE TABLE IF NOT EXISTS customers (
      customer_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      cart_id_pk INTEGER DEFAULT 0,
      cart_customer_id VARCHAR(255) DEFAULT NULL,
      customer_pin INTEGER NOT NULL DEFAULT 0,
      pos_customer VARCHAR(1) NOT NULL DEFAULT 'N',
      name VARCHAR(255) DEFAULT NULL,
      first_name VARCHAR(191) DEFAULT NULL,
      last_name VARCHAR(191) DEFAULT NULL,
      email VARCHAR(100) UNIQUE DEFAULT NULL,
      password VARCHAR(191) DEFAULT NULL,
      birth_date DATE DEFAULT NULL,
      role_id INTEGER NOT NULL DEFAULT 0,
      guest_customer VARCHAR(1) NOT NULL DEFAULT '0',
      access_token VARCHAR(255) DEFAULT NULL,
      security_question_id INTEGER NOT NULL DEFAULT 0,
      security_answer VARCHAR(191) DEFAULT NULL,
      user_address1 VARCHAR(191) DEFAULT NULL,
      user_address2 VARCHAR(191) DEFAULT NULL,
      user_city VARCHAR(191) DEFAULT NULL,
      user_state VARCHAR(191) DEFAULT NULL,
      user_zipcode VARCHAR(191) DEFAULT NULL,
      user_country VARCHAR(191) DEFAULT NULL,
      contact_number VARCHAR(191) DEFAULT NULL,
      display_on_listing VARCHAR(1) NOT NULL DEFAULT 'Y',
      show_action_checkbox VARCHAR(1) NOT NULL DEFAULT 'Y',
      web_token VARCHAR(255) DEFAULT NULL,
      api_token VARCHAR(255) DEFAULT NULL,
      session_id VARCHAR(255) DEFAULT NULL,
      device_id VARCHAR(255) DEFAULT NULL,
      device_name VARCHAR(255) DEFAULT NULL,
      item_type VARCHAR(25) NOT NULL DEFAULT 'users',
      wallet_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      blocked VARCHAR(1) NOT NULL DEFAULT 'N',
      display_order INTEGER NOT NULL DEFAULT 0,
      display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
      created_by INTEGER NOT NULL DEFAULT 0,
      created_by_name VARCHAR(255) DEFAULT NULL,
      created_by_role INTEGER NOT NULL DEFAULT 0,
      deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
      deleted_by INTEGER NOT NULL DEFAULT 0,
      deleted_by_name VARCHAR(255) DEFAULT NULL,
      deleted_time TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `,
    "Table 'customers' created successfully",
    "Failed to create table 'customers'"
  );

  console.log('\n✅ Migration completed - All tables processed.');
  await pool.end();
}

// Run migration only if this script is executed directly (not required by another module)
if (require.main === module) {
  migrate().catch(err => {
    console.error('\n❌ Migration failed with fatal error:', err);
    pool.end().finally(() => process.exit(1));
  });
} else {
  module.exports = migrate;
}
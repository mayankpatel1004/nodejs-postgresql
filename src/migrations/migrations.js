const db = require('../../connection');
const util = require("util");
const query = util.promisify(db.query).bind(db);

async function migrate() {
  try {
    // Table: items
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS items (
          item_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          site_id INT NOT NULL DEFAULT 0,
          item_title VARCHAR(255) DEFAULT NULL,
          item_alias VARCHAR(255) DEFAULT NULL,
          item_parent INT NOT NULL DEFAULT 0,
          item_type VARCHAR(255) DEFAULT NULL,
          item_sections_id VARCHAR(255) DEFAULT NULL,
          item_description TEXT DEFAULT NULL,
          attachment1 VARCHAR(255) DEFAULT NULL,
          attachment2 VARCHAR(255) DEFAULT NULL,
          item_shortdescription TEXT DEFAULT NULL,
          user_id INT NOT NULL DEFAULT 0,
          controller VARCHAR(50) DEFAULT NULL,
          action VARCHAR(50) DEFAULT 'index',
          published_at DATE DEFAULT NULL,
          published_end_at DATE DEFAULT NULL,
          meta_title VARCHAR(255) DEFAULT NULL,
          meta_description TEXT DEFAULT NULL,
          display_order INT NOT NULL DEFAULT 0,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          created_by INT NOT NULL DEFAULT 0,
          created_by_name VARCHAR(255) DEFAULT NULL,
          created_by_role INT NOT NULL DEFAULT 0,
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          deleted_by INT NOT NULL DEFAULT 0,
          deleted_by_name VARCHAR(255) DEFAULT NULL,
          deleted_time TIMESTAMP DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `;
      await query(sqlQuery);
      console.log("✅ Table 'items' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'items':", err.message);
    }

    // Action table start ///
    try {
    let sqlQuery = `
        CREATE TABLE IF NOT EXISTS action (
          action_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          action VARCHAR(255) DEFAULT NULL,
          record_id INT NOT NULL DEFAULT 0,
          table_name VARCHAR(255) DEFAULT NULL,
          record_name VARCHAR(255) DEFAULT NULL,
          display_order INT NOT NULL DEFAULT 0,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          created_by INT NOT NULL DEFAULT 0,
          created_by_name VARCHAR(255) DEFAULT NULL,
          created_by_role INT NOT NULL DEFAULT 0,
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          deleted_by INT NOT NULL DEFAULT 0,
          deleted_by_name VARCHAR(255) DEFAULT NULL,
          deleted_time TIMESTAMP DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
      await query(sqlQuery);
      console.log("✅ Table 'action' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'action':", err.message);
    }

    // Table: item_section
    try {
      sqlQuery = `
        CREATE TABLE IF NOT EXISTS item_section (
    item_section_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    site_id INT NOT NULL DEFAULT 0,
    item_section_parent_id INT NOT NULL DEFAULT 0,
    section_title VARCHAR(255) DEFAULT NULL,
    section_alias VARCHAR(255) DEFAULT NULL,
    item_type VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    attachment1 VARCHAR(255) DEFAULT NULL,
    user_id INTEGER DEFAULT 0,
    meta_title VARCHAR(255) DEFAULT NULL,
    meta_description TEXT DEFAULT NULL,
    display_order INT NOT NULL DEFAULT 0,
    display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
    created_by INT NOT NULL DEFAULT 0,
    created_by_name VARCHAR(255) DEFAULT NULL,
    created_by_role INT NOT NULL DEFAULT 0,
    deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
    deleted_by INT NOT NULL DEFAULT 0,
    deleted_by_name VARCHAR(255) DEFAULT NULL,
    deleted_time TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
      `;
      await query(sqlQuery);
      console.log("✅ Table 'item_section' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'item_section':", err.message);
    }

    // Table: item_section_relation
    try {
      sqlQuery = `
        CREATE TABLE IF NOT EXISTS item_section_relation (
    item_section_relation_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    site_id INT NOT NULL DEFAULT 0,
    item_id BIGINT NOT NULL DEFAULT 0,
    section_id BIGINT NOT NULL DEFAULT 0,
    display_order INT NOT NULL DEFAULT 0,
    display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
    created_by INT NOT NULL DEFAULT 0,
    created_by_name VARCHAR(255) DEFAULT NULL,
    created_by_role INT NOT NULL DEFAULT 0,
    deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
    deleted_by INT NOT NULL DEFAULT 0,
    deleted_by_name VARCHAR(255) DEFAULT NULL,
    deleted_time TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
      `;
      await query(sqlQuery);
      console.log("✅ Table 'item_section_relation' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'item_section_relation':", err.message);
    }

    // Table: meta_details
    try {
      sqlQuery = `
        CREATE TABLE IF NOT EXISTS meta_details (
    meta_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    site_id INT NOT NULL DEFAULT 0,
    parent_id INT NOT NULL DEFAULT 0,
    end_points VARCHAR(255) DEFAULT NULL,
    page_title VARCHAR(255) DEFAULT NULL,
    meta_title VARCHAR(255) DEFAULT NULL,
    meta_description VARCHAR(255) DEFAULT NULL,
    sidebar_title VARCHAR(255) DEFAULT NULL,
    sidebar_icon VARCHAR(255) DEFAULT NULL,
    sidebar_order INT NOT NULL DEFAULT 0,
    params VARCHAR(255) DEFAULT NULL,
    is_module SMALLINT NOT NULL DEFAULT 0,
    display_order INT NOT NULL DEFAULT 0,
    display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
    created_by INT NOT NULL DEFAULT 0,
    created_by_name VARCHAR(255) DEFAULT NULL,
    created_by_role INT NOT NULL DEFAULT 0,
    deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
    deleted_by INT NOT NULL DEFAULT 0,
    deleted_by_name VARCHAR(255) DEFAULT NULL,
    deleted_time TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;
      await query(sqlQuery);
      console.log("✅ Table 'meta_details' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'meta_details':", err.message);
    }

    // Table: role
    try {
      sqlQuery = `
        CREATE TABLE IF NOT EXISTS "role" (
          role_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          site_id INT NOT NULL DEFAULT 0,
          role_title VARCHAR(255) DEFAULT NULL,
          item_alias VARCHAR(255) DEFAULT NULL,
          item_type VARCHAR(255) NOT NULL DEFAULT 'role',
          display_on_listing VARCHAR(1) NOT NULL DEFAULT 'Y',
          show_action_checkbox VARCHAR(1) NOT NULL DEFAULT 'Y',
          allow_delete VARCHAR(1) NOT NULL DEFAULT 'Y',
          display_order INT NOT NULL DEFAULT 0,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          created_by INT NOT NULL DEFAULT 0,
          created_by_name VARCHAR(255) DEFAULT NULL,
          created_by_role INT NOT NULL DEFAULT 0,
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          deleted_by INT NOT NULL DEFAULT 0,
          deleted_by_name VARCHAR(255) DEFAULT NULL,
          deleted_time TIMESTAMP DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `;
      await query(sqlQuery);
      console.log("✅ Table 'role' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'role':", err.message);
    }

    // Table: role_access
    try {
      sqlQuery = `
        CREATE TABLE IF NOT EXISTS role_access (
    role_access_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    site_id INT NOT NULL DEFAULT 0,
    role_id INTEGER DEFAULT 0,
    module_id INTEGER DEFAULT 0,
    grant_add VARCHAR(1) NOT NULL DEFAULT 'N',
    grant_edit VARCHAR(1) NOT NULL DEFAULT 'N',
    grant_delete VARCHAR(1) NOT NULL DEFAULT 'N',
    grant_view VARCHAR(1) NOT NULL DEFAULT 'N',
    display_order INT NOT NULL DEFAULT 0,
    display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
    created_by INT NOT NULL DEFAULT 0,
    created_by_name VARCHAR(255) DEFAULT NULL,
    created_by_role INT NOT NULL DEFAULT 0,
    deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
    deleted_by INT NOT NULL DEFAULT 0,
    deleted_by_name VARCHAR(255) DEFAULT NULL,
    deleted_time TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;
      await query(sqlQuery);
      console.log("✅ Table 'role_access' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'role_access':", err.message);
    }

    // Table: site_config
    try {
      sqlQuery = `
        CREATE TABLE IF NOT EXISTS site_config (
    config_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    site_id INT NOT NULL DEFAULT 0,
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
    display_order INT NOT NULL DEFAULT 0,
    display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
    created_by INT NOT NULL DEFAULT 0,
    created_by_name VARCHAR(255) DEFAULT NULL,
    created_by_role INT NOT NULL DEFAULT 0,
    deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
    deleted_by INT NOT NULL DEFAULT 0,
    deleted_by_name VARCHAR(255) DEFAULT NULL,
    deleted_time TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
      `;
      await query(sqlQuery);
      console.log("✅ Table 'site_config' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'site_config':", err.message);
    }

    // Table: site_config_parent
    try {
      sqlQuery = `
        CREATE TABLE IF NOT EXISTS site_config_parent (
            site_config_parent_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            site_id INTEGER NOT NULL,
            site_config_title VARCHAR(191) NOT NULL,
            classname VARCHAR(191) NOT NULL,
            root_user_only VARCHAR(1) NOT NULL,
            display_order INT NOT NULL DEFAULT 0,
            display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
            created_by INT NOT NULL DEFAULT 0,
            created_by_name VARCHAR(255) DEFAULT NULL,
            created_by_role INT NOT NULL DEFAULT 0,
            deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
            deleted_by INT NOT NULL DEFAULT 0,
            deleted_by_name VARCHAR(255) DEFAULT NULL,
            deleted_time TIMESTAMP DEFAULT NULL,
            created_at TIMESTAMP DEFAULT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await query(sqlQuery);
      console.log("✅ Table 'site_config_parent' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'site_config_parent':", err.message);
    }

    // Table: users
    try {
      sqlQuery = `
        CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    site_id INT NOT NULL DEFAULT 0,
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
    display_order INT NOT NULL DEFAULT 0,
    display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
    created_by INT NOT NULL DEFAULT 0,
    created_by_name VARCHAR(255) DEFAULT NULL,
    created_by_role INT NOT NULL DEFAULT 0,
    deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
    deleted_by INT NOT NULL DEFAULT 0,
    deleted_by_name VARCHAR(255) DEFAULT NULL,
    deleted_time TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
      `;
      await query(sqlQuery);
      console.log("✅ Table 'users' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'users':", err.message);
    }

    // Add column add_1 to users table
    try {
      let sqlQuery = `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS add_1 VARCHAR(255) DEFAULT NULL
      `;
      await query(sqlQuery);
      console.log("✅ Column 'add_1' added to 'users' table successfully");
    } catch (err) {
      console.error("❌ Failed to add column 'add_1' to 'users' table:", err.message);
    }

    console.log("\n✅ Migration completed - All tables processed");
    await db.end();
    process.exit();
  } catch (err) {
    console.error("\n❌ Migration failed with fatal error:", err);
    await db.end();
    process.exit(1);
  }
}

migrate();

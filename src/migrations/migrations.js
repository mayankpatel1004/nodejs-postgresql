const db = require('../db/connection');
const util = require("util");
const query = util.promisify(db.query).bind(db);

async function migrate() {
  try {
    // Table: items
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS items (
          item_id SERIAL PRIMARY KEY,
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
          created_by INT NOT NULL DEFAULT 0,
          created_by_name VARCHAR(255) DEFAULT NULL,
          created_by_role INT NOT NULL DEFAULT 0,
          display_order INT NOT NULL DEFAULT 0,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
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

    // Table: item_section
    try {
      sqlQuery = `
        CREATE TABLE IF NOT EXISTS item_section (
          item_section_id SERIAL PRIMARY KEY,
          site_id INT NOT NULL DEFAULT 0,
          item_section_parent_id INT NOT NULL DEFAULT 0,
          section_title VARCHAR(255) DEFAULT NULL,
          section_alias VARCHAR(255) DEFAULT NULL,
          item_type VARCHAR(255) DEFAULT NULL,
          description TEXT DEFAULT NULL,
          attachment1 VARCHAR(255) DEFAULT NULL,
          user_id INT DEFAULT 0,
          display_order INT DEFAULT 0,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          meta_title VARCHAR(255) DEFAULT NULL,
          meta_description TEXT DEFAULT NULL,
          created_by INT NOT NULL DEFAULT 0,
          created_by_name VARCHAR(255) DEFAULT NULL,
          created_by_role INT NOT NULL DEFAULT 0,
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          deleted_by INT NOT NULL DEFAULT 0,
          deleted_by_name VARCHAR(255) DEFAULT NULL,
          deleted_time TIMESTAMP DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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
          item_section_relation_id SERIAL PRIMARY KEY,
          site_id INT NOT NULL DEFAULT 0,
          item_id BIGINT NOT NULL DEFAULT 0,
          section_id BIGINT NOT NULL DEFAULT 0,
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          deleted_by INT NOT NULL DEFAULT 0,
          deleted_time TIMESTAMP DEFAULT NULL
        )
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
          meta_id SERIAL PRIMARY KEY,
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
          deleted_status VARCHAR(4) NOT NULL DEFAULT 'N'
        )
      `;
      await query(sqlQuery);
      console.log("✅ Table 'meta_details' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'meta_details':", err.message);
    }

    // Table: role
    try {
      sqlQuery = `
        CREATE TABLE IF NOT EXISTS role (
          role_id SERIAL PRIMARY KEY,
          site_id INT NOT NULL DEFAULT 0,
          role_title VARCHAR(255) DEFAULT NULL,
          item_alias VARCHAR(255) DEFAULT NULL,
          item_type VARCHAR(255) NOT NULL DEFAULT 'role',
          display_order INT NOT NULL DEFAULT 0,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          display_on_listing VARCHAR(1) NOT NULL DEFAULT 'Y',
          show_action_checkbox VARCHAR(1) NOT NULL DEFAULT 'Y',
          allow_delete VARCHAR(1) NOT NULL DEFAULT 'Y',
          created_by INT NOT NULL DEFAULT 0,
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          deleted_by INT NOT NULL DEFAULT 0,
          deleted_by_name VARCHAR(255) DEFAULT NULL,
          deleted_time TIMESTAMP DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
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
          role_access_id SERIAL PRIMARY KEY,
          site_id INT NOT NULL DEFAULT 0,
          role_id INT DEFAULT 0,
          module_id INT DEFAULT 0,
          grant_add VARCHAR(1) NOT NULL DEFAULT 'N',
          grant_edit VARCHAR(1) NOT NULL DEFAULT 'N',
          grant_delete VARCHAR(1) NOT NULL DEFAULT 'N',
          grant_view VARCHAR(1) NOT NULL DEFAULT 'N',
          display_order INT NOT NULL DEFAULT 0,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await query(sqlQuery);
      console.log("✅ Table 'role_access' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'role_access':", err.message);
    }

    // Table: site_config
    try {
      sqlQuery = `
        CREATE TABLE IF NOT EXISTS site_config (
          config_id SERIAL PRIMARY KEY,
          site_id INT NOT NULL DEFAULT 0,
          config_title VARCHAR(1024) DEFAULT NULL,
          config_name VARCHAR(1024) DEFAULT NULL,
          config_value TEXT DEFAULT NULL,
          input_type VARCHAR(15) DEFAULT NULL,
          size INT NOT NULL DEFAULT 100,
          maxlength INT NOT NULL DEFAULT 100,
          input_type_title VARCHAR(100) DEFAULT NULL,
          class VARCHAR(100) DEFAULT 'textbox',
          required VARCHAR(1) DEFAULT 'O',
          display_order INT NOT NULL DEFAULT 0,
          comments VARCHAR(255) DEFAULT NULL,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          additional VARCHAR(100) DEFAULT NULL,
          display_on_dashboard VARCHAR(1) NOT NULL DEFAULT 'N',
          display_on_third_party VARCHAR(1) NOT NULL DEFAULT 'N',
          site_config_parent_id SMALLINT NOT NULL DEFAULT 0,
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          root_user_only VARCHAR(1) NOT NULL DEFAULT 'N',
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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
          site_config_parent_id SERIAL PRIMARY KEY,
          site_id INT NOT NULL,
          site_config_title VARCHAR(191) NOT NULL,
          display_order INT NOT NULL,
          display_status VARCHAR(1) NOT NULL,
          class VARCHAR(191) NOT NULL,
          deleted_status VARCHAR(1) NOT NULL,
          root_user_only VARCHAR(1) NOT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT NULL
        )
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
          user_id SERIAL PRIMARY KEY,
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
          created_by INT NOT NULL DEFAULT 0,
          created_by_name VARCHAR(255) DEFAULT NULL,
          created_by_role INT NOT NULL DEFAULT 0,
          web_or_app VARCHAR(4) NOT NULL DEFAULT 'App',
          active_status VARCHAR(25) NOT NULL DEFAULT 'N',
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          deleted_status VARCHAR(4) NOT NULL DEFAULT 'N',
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

        // Table: customers
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS customers (
          customer_id SERIAL PRIMARY KEY,
          cart_id_pk INT DEFAULT 0,
          cart_customer_id VARCHAR(255) DEFAULT NULL,
          customer_pin INT NOT NULL DEFAULT 0,
          pos_customer VARCHAR(1) NOT NULL DEFAULT 'N',
          name VARCHAR(255) DEFAULT NULL,
          first_name VARCHAR(191) DEFAULT NULL,
          last_name VARCHAR(191) DEFAULT NULL,
          email VARCHAR(100) UNIQUE DEFAULT NULL,
          password VARCHAR(191) DEFAULT NULL,
          birth_date DATE DEFAULT NULL,
          role_id INT NOT NULL DEFAULT 0,
          guest_customer VARCHAR(1) NOT NULL DEFAULT '0',
          access_token VARCHAR(255) DEFAULT NULL,
          security_question_id INT NOT NULL DEFAULT 0,
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
          display_order INT NOT NULL DEFAULT 0,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          blocked VARCHAR(1) NOT NULL DEFAULT 'N',
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          deleted_by INT NOT NULL DEFAULT 0,
          deleted_by_name VARCHAR(255) DEFAULT NULL,
          deleted_time TIMESTAMP DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT NULL
        )
      `;
      await query(sqlQuery);
      
      // Create indexes
      await query(`CREATE INDEX IF NOT EXISTS idx_customers_role_id ON customers(role_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_customers_display_status ON customers(display_status)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at)`);
      
      console.log("✅ Table 'customers' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'customers':", err.message);
    }

    // Table: ec_cart
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_cart (
          cart_id SERIAL PRIMARY KEY,
          cart_customer_id VARCHAR(255) DEFAULT NULL,
          cart_sub_id INT NOT NULL DEFAULT 0,
          session_id VARCHAR(255) DEFAULT NULL,
          is_customer VARCHAR(1) NOT NULL DEFAULT 'N',
          customer_id INT NOT NULL DEFAULT 0,
          customer_name VARCHAR(255) DEFAULT NULL,
          birth_date VARCHAR(255) DEFAULT NULL,
          order_status VARCHAR(255) DEFAULT NULL,
          billing_first_name VARCHAR(255) DEFAULT NULL,
          billing_last_name VARCHAR(255) DEFAULT NULL,
          billing_address_1 VARCHAR(255) DEFAULT NULL,
          billing_address_2 VARCHAR(255) DEFAULT NULL,
          billing_city VARCHAR(255) DEFAULT NULL,
          billing_state_id INT NOT NULL DEFAULT 0,
          billing_state VARCHAR(255) DEFAULT NULL,
          billing_country_id INT NOT NULL DEFAULT 0,
          billing_country VARCHAR(255) DEFAULT NULL,
          billing_zipcode VARCHAR(255) DEFAULT NULL,
          billing_contact VARCHAR(255) DEFAULT NULL,
          billing_email VARCHAR(255) DEFAULT NULL,
          shipping_first_name VARCHAR(255) DEFAULT NULL,
          shipping_last_name VARCHAR(255) DEFAULT NULL,
          shipping_address_1 VARCHAR(255) DEFAULT NULL,
          shipping_address_2 VARCHAR(255) DEFAULT NULL,
          shipping_city VARCHAR(255) DEFAULT NULL,
          shipping_state_id INT NOT NULL DEFAULT 0,
          shipping_state VARCHAR(255) DEFAULT NULL,
          shipping_country VARCHAR(255) DEFAULT NULL,
          shipping_country_id INT NOT NULL DEFAULT 0,
          shipping_zipcode VARCHAR(255) DEFAULT NULL,
          shipping_contact VARCHAR(255) DEFAULT NULL,
          shipping_email VARCHAR(255) DEFAULT NULL,
          coupon_code VARCHAR(255) DEFAULT NULL,
          coupon_type VARCHAR(255) DEFAULT NULL,
          item_coupon_type VARCHAR(255) DEFAULT NULL,
          currancy VARCHAR(10) DEFAULT NULL,
          cashback_amount_applied DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          coupon_amount_applied DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          cashback_wallet_amount_used DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          total_ordered_quantity INT NOT NULL DEFAULT 0,
          total_items_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          total_items_tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          total_items_shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          order_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          ip_address VARCHAR(45) DEFAULT NULL,
          is_pos_order VARCHAR(1) NOT NULL DEFAULT 'N',
          payment_type VARCHAR(255) DEFAULT NULL,
          shipping_type VARCHAR(255) DEFAULT NULL,
          shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          order_notes TEXT DEFAULT NULL,
          device VARCHAR(255) DEFAULT '1.0',
          device_id VARCHAR(255) DEFAULT NULL,
          device_type VARCHAR(255) DEFAULT NULL,
          browser_name VARCHAR(255) DEFAULT NULL,
          user_agent TEXT DEFAULT NULL,
          browser_version VARCHAR(100) DEFAULT NULL,
          platform VARCHAR(255) DEFAULT NULL,
          browser_pattern VARCHAR(255) DEFAULT NULL,
          site_id SMALLINT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          expire_at TIMESTAMP DEFAULT NULL
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_ec_cart_customer_id ON ec_cart(customer_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_ec_cart_session_id ON ec_cart(session_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_ec_cart_created_at ON ec_cart(created_at)`);
      
      console.log("✅ Table 'ec_cart' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_cart':", err.message);
    }

    // Table: ec_cart_product
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_cart_product (
          cart_product_id SERIAL PRIMARY KEY,
          cart_id INT NOT NULL DEFAULT 0,
          cart_sub_id INT NOT NULL DEFAULT 0,
          customer_id INT NOT NULL DEFAULT 0,
          item_id INT NOT NULL DEFAULT 0,
          user_id INT NOT NULL DEFAULT 0,
          user_name VARCHAR(255) DEFAULT NULL,
          user_email VARCHAR(255) DEFAULT NULL,
          product_price_id INT NOT NULL DEFAULT 0,
          item_name VARCHAR(255) DEFAULT NULL,
          item_alias VARCHAR(255) DEFAULT NULL,
          item_code VARCHAR(255) DEFAULT NULL,
          ordered_quantity INT NOT NULL DEFAULT 0,
          product_attribute_1 VARCHAR(255) DEFAULT NULL,
          product_attribute_2 VARCHAR(255) DEFAULT NULL,
          product_attribute_3 VARCHAR(255) DEFAULT NULL,
          product_option_1 VARCHAR(255) DEFAULT NULL,
          product_option_2 VARCHAR(255) DEFAULT NULL,
          product_option_3 VARCHAR(255) DEFAULT NULL,
          product_option_4 VARCHAR(255) DEFAULT NULL,
          product_option_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          product_option_price_display DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          currency VARCHAR(255) DEFAULT NULL,
          is_taxable VARCHAR(1) NOT NULL DEFAULT 'Y',
          item_tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          is_default_price VARCHAR(1) NOT NULL DEFAULT 'Y',
          product_quantity INT NOT NULL DEFAULT 0,
          special_price_from_date DATE DEFAULT NULL,
          special_price_to_date DATE DEFAULT NULL,
          item_price_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_tax_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_shipping_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          final_item_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_ec_cart_product_cart_id ON ec_cart_product(cart_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_ec_cart_product_item_id ON ec_cart_product(item_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_ec_cart_product_customer_id ON ec_cart_product(customer_id)`);
      
      console.log("✅ Table 'ec_cart_product' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_cart_product':", err.message);
    }

    // Table: ec_cashback_credit_transaction
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_cashback_credit_transaction (
          cashbackcredit_transaction_id SERIAL PRIMARY KEY,
          user_id INT NOT NULL DEFAULT 0,
          order_id INT DEFAULT 0,
          customer_id INT NOT NULL DEFAULT 0,
          cashback_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          site_id SMALLINT NOT NULL DEFAULT 0,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_cashback_credit_customer_id ON ec_cashback_credit_transaction(customer_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_cashback_credit_order_id ON ec_cashback_credit_transaction(order_id)`);
      
      console.log("✅ Table 'ec_cashback_credit_transaction' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_cashback_credit_transaction':", err.message);
    }

    // Table: ec_cashback_transaction
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_cashback_transaction (
          cashback_id SERIAL PRIMARY KEY,
          customer_id INT NOT NULL DEFAULT 0,
          customer_name VARCHAR(255) DEFAULT NULL,
          customer_email VARCHAR(255) DEFAULT NULL,
          order_id INT NOT NULL DEFAULT 0,
          currency VARCHAR(10) DEFAULT NULL,
          cashback_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          transaction_id VARCHAR(255) DEFAULT NULL,
          coupon_code VARCHAR(255) DEFAULT NULL,
          coupon_type VARCHAR(255) DEFAULT NULL,
          item_coupon_type VARCHAR(255) DEFAULT NULL,
          site_id SMALLINT NOT NULL DEFAULT 0,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_cashback_customer_id ON ec_cashback_transaction(customer_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_cashback_order_id ON ec_cashback_transaction(order_id)`);
      
      console.log("✅ Table 'ec_cashback_transaction' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_cashback_transaction':", err.message);
    }

    // Table: ec_closeday
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_closeday (
          closeday_id SERIAL PRIMARY KEY,
          opening_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          closing_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          closing_time TIMESTAMP DEFAULT NULL,
          closed_by INT DEFAULT NULL,
          closed_by_name VARCHAR(255) DEFAULT NULL,
          closing_notes TEXT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_closeday_closed_by ON ec_closeday(closed_by)`);
      
      console.log("✅ Table 'ec_closeday' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_closeday':", err.message);
    }

    // Table: ec_coupon
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_coupon (
          coupon_id SERIAL PRIMARY KEY,
          item_type VARCHAR(255) DEFAULT 'discount',
          coupon_code_type VARCHAR(255) NOT NULL DEFAULT 'alluser',
          specific_user_id INT NOT NULL DEFAULT 0,
          coupon_title VARCHAR(255) DEFAULT NULL,
          coupon_alias VARCHAR(255) DEFAULT NULL,
          coupon_description TEXT DEFAULT NULL,
          coupon_terms_conditions TEXT DEFAULT NULL,
          order_calculation_required VARCHAR(1) NOT NULL DEFAULT 'N',
          minimum_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          coupon_item_type VARCHAR(255) DEFAULT 'discount',
          coupon_item_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          coupon_code VARCHAR(255) UNIQUE DEFAULT NULL,
          amount_type VARCHAR(255) DEFAULT 'Fixed',
          currency VARCHAR(20) DEFAULT '$',
          coupon_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          coupon_amount_maximum DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          user_per_customer INT DEFAULT 1,
          created_user_id INT NOT NULL DEFAULT 0,
          start_date TIMESTAMP DEFAULT NULL,
          end_date TIMESTAMP DEFAULT NULL,
          site_id SMALLINT DEFAULT NULL,
          item_type_alias VARCHAR(255) DEFAULT NULL,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          deleted_user_id INT DEFAULT NULL,
          deleted_by_name VARCHAR(255) DEFAULT NULL,
          deleted_time TIMESTAMP DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_coupon_display_status ON ec_coupon(display_status)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_coupon_start_date ON ec_coupon(start_date)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_coupon_end_date ON ec_coupon(end_date)`);
      
      console.log("✅ Table 'ec_coupon' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_coupon':", err.message);
    }

    // Table: ec_order
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_order (
          order_id SERIAL PRIMARY KEY,
          order_id_unique VARCHAR(255) UNIQUE DEFAULT NULL,
          cart_id INT NOT NULL DEFAULT 0,
          cart_customer_id VARCHAR(255) DEFAULT NULL,
          cart_sub_id INT NOT NULL DEFAULT 0,
          session_id VARCHAR(255) DEFAULT NULL,
          is_customer VARCHAR(1) NOT NULL DEFAULT 'N',
          customer_id INT NOT NULL DEFAULT 0,
          customer_name VARCHAR(255) DEFAULT NULL,
          order_status VARCHAR(255) DEFAULT NULL,
          cancelled_by INT DEFAULT NULL,
          cancelled_by_name VARCHAR(255) DEFAULT NULL,
          cancelled_reason VARCHAR(255) DEFAULT NULL,
          cancelled_at TIMESTAMP DEFAULT NULL,
          billing_first_name VARCHAR(255) DEFAULT NULL,
          billing_last_name VARCHAR(255) DEFAULT NULL,
          billing_address_1 VARCHAR(255) DEFAULT NULL,
          billing_address_2 VARCHAR(255) DEFAULT NULL,
          billing_city VARCHAR(255) DEFAULT NULL,
          billing_state_id INT NOT NULL DEFAULT 0,
          billing_state VARCHAR(255) DEFAULT NULL,
          billing_country_id INT NOT NULL DEFAULT 0,
          billing_country VARCHAR(255) DEFAULT NULL,
          billing_zipcode VARCHAR(255) DEFAULT NULL,
          billing_contact VARCHAR(255) DEFAULT NULL,
          billing_email VARCHAR(255) DEFAULT NULL,
          shipping_first_name VARCHAR(255) DEFAULT NULL,
          shipping_last_name VARCHAR(255) DEFAULT NULL,
          shipping_address_1 VARCHAR(255) DEFAULT NULL,
          shipping_address_2 VARCHAR(255) DEFAULT NULL,
          shipping_city VARCHAR(255) DEFAULT NULL,
          shipping_state_id INT NOT NULL DEFAULT 0,
          shipping_state VARCHAR(255) DEFAULT NULL,
          shipping_country VARCHAR(255) DEFAULT NULL,
          shipping_country_id INT NOT NULL DEFAULT 0,
          shipping_zipcode VARCHAR(255) DEFAULT NULL,
          shipping_contact VARCHAR(255) DEFAULT NULL,
          shipping_email VARCHAR(255) DEFAULT NULL,
          coupon_code VARCHAR(255) DEFAULT NULL,
          coupon_type VARCHAR(255) DEFAULT NULL,
          item_coupon_type VARCHAR(255) DEFAULT NULL,
          currency VARCHAR(10) DEFAULT NULL,
          cashback_amount_applied DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          coupon_amount_applied DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          cashback_wallet_amount_used DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          total_ordered_quantity INT NOT NULL DEFAULT 0,
          total_items_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          total_items_tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          total_items_shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          order_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          ip_address VARCHAR(45) DEFAULT NULL,
          is_pos_order VARCHAR(1) NOT NULL DEFAULT 'N',
          payment_type VARCHAR(255) DEFAULT NULL,
          shipping_type VARCHAR(255) DEFAULT NULL,
          shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          order_notes TEXT DEFAULT NULL,
          device VARCHAR(255) DEFAULT '1.0',
          device_id VARCHAR(255) DEFAULT NULL,
          device_type VARCHAR(255) DEFAULT NULL,
          browser_name VARCHAR(255) DEFAULT NULL,
          user_agent TEXT DEFAULT NULL,
          browser_version VARCHAR(100) DEFAULT NULL,
          platform VARCHAR(255) DEFAULT NULL,
          browser_pattern VARCHAR(255) DEFAULT NULL,
          site_id SMALLINT NOT NULL DEFAULT 0,
          sync_to_live VARCHAR(1) NOT NULL DEFAULT 'N',
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          deleted_by INT NOT NULL DEFAULT 0,
          deleted_by_name VARCHAR(255) DEFAULT NULL,
          deleted_time TIMESTAMP DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          expire_at TIMESTAMP DEFAULT NULL,
          transaction_id VARCHAR(255) DEFAULT NULL,
          payment_status VARCHAR(255) DEFAULT NULL,
          cashback_credited VARCHAR(1) NOT NULL DEFAULT 'N',
          cashback_credited_user_id INT NOT NULL DEFAULT 0,
          cashback_credited_date TIMESTAMP DEFAULT NULL
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_ec_order_customer_id ON ec_order(customer_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_ec_order_order_status ON ec_order(order_status)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_ec_order_created_at ON ec_order(created_at)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_ec_order_payment_status ON ec_order(payment_status)`);
      
      console.log("✅ Table 'ec_order' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_order':", err.message);
    }

    // Table: ec_order_payment_details
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_order_payment_details (
          order_payment_details_id SERIAL PRIMARY KEY,
          order_id INT NOT NULL DEFAULT 0,
          order_status VARCHAR(255) DEFAULT NULL,
          order_key VARCHAR(255) DEFAULT NULL,
          order_value TEXT DEFAULT NULL,
          payment_gateway_name VARCHAR(255) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_payment_details_order_id ON ec_order_payment_details(order_id)`);
      
      console.log("✅ Table 'ec_order_payment_details' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_order_payment_details':", err.message);
    }

    // Table: ec_order_products
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_order_products (
          order_product_id SERIAL PRIMARY KEY,
          cart_id INT NOT NULL DEFAULT 0,
          order_id INT NOT NULL DEFAULT 0,
          order_status VARCHAR(255) DEFAULT NULL,
          cart_sub_id INT NOT NULL DEFAULT 0,
          customer_id INT NOT NULL DEFAULT 0,
          item_id INT NOT NULL DEFAULT 0,
          user_id INT NOT NULL DEFAULT 0,
          user_name VARCHAR(255) DEFAULT NULL,
          user_email VARCHAR(255) DEFAULT NULL,
          product_price_id INT NOT NULL DEFAULT 0,
          item_name VARCHAR(255) DEFAULT NULL,
          item_alias VARCHAR(255) DEFAULT NULL,
          item_code VARCHAR(255) DEFAULT NULL,
          ordered_quantity INT NOT NULL DEFAULT 0,
          product_attribute_1 VARCHAR(255) DEFAULT NULL,
          product_attribute_2 VARCHAR(255) DEFAULT NULL,
          product_attribute_3 VARCHAR(255) DEFAULT NULL,
          product_option_1 VARCHAR(255) DEFAULT NULL,
          product_option_2 VARCHAR(255) DEFAULT NULL,
          product_option_3 VARCHAR(255) DEFAULT NULL,
          product_option_4 VARCHAR(255) DEFAULT NULL,
          product_option_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          product_option_price_display DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          currency VARCHAR(255) DEFAULT NULL,
          is_taxable VARCHAR(1) NOT NULL DEFAULT 'Y',
          item_tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          is_default_price VARCHAR(1) NOT NULL DEFAULT 'Y',
          item_price_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_tax_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_shipping_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          final_item_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          review_added VARCHAR(1) NOT NULL DEFAULT 'N',
          review_request_counter SMALLINT NOT NULL DEFAULT 0,
          request_exchange_refund VARCHAR(1) NOT NULL DEFAULT 'N',
          exchange_refund_type VARCHAR(255) DEFAULT NULL,
          request_exchange_refund_approved VARCHAR(1) NOT NULL DEFAULT 'N',
          request_exchange_refund_approved_date TIMESTAMP DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_order_products_order_id ON ec_order_products(order_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_order_products_item_id ON ec_order_products(item_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_order_products_customer_id ON ec_order_products(customer_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_order_products_product_price_id ON ec_order_products(product_price_id)`);
      
      console.log("✅ Table 'ec_order_products' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_order_products':", err.message);
    }

    // Table: ec_order_products_return
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_order_products_return (
          products_return_id SERIAL PRIMARY KEY,
          user_id INT NOT NULL DEFAULT 0,
          user_name VARCHAR(255) DEFAULT NULL,
          user_email VARCHAR(255) DEFAULT NULL,
          product_price_id INT NOT NULL DEFAULT 0,
          item_id INT NOT NULL DEFAULT 0,
          item_title VARCHAR(255) DEFAULT NULL,
          item_alias VARCHAR(255) DEFAULT NULL,
          item_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_quantity DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_shipping_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_final_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          order_id INT NOT NULL DEFAULT 0,
          order_status VARCHAR(255) DEFAULT NULL,
          order_product_id INT NOT NULL DEFAULT 0,
          customer_id INT NOT NULL DEFAULT 0,
          customer_name VARCHAR(255) DEFAULT NULL,
          customer_email VARCHAR(255) DEFAULT NULL,
          customer_contact VARCHAR(255) DEFAULT NULL,
          exchange_refund VARCHAR(255) DEFAULT NULL,
          exchange_refund_reason VARCHAR(255) DEFAULT NULL,
          exchange_refund_description TEXT DEFAULT NULL,
          admin_approved VARCHAR(1) NOT NULL DEFAULT 'N',
          admin_notes TEXT DEFAULT NULL,
          admin_approve_date TIMESTAMP DEFAULT NULL,
          photo_1 VARCHAR(255) DEFAULT NULL,
          photo_2 VARCHAR(255) DEFAULT NULL,
          photo_3 VARCHAR(255) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT NULL
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_products_return_order_id ON ec_order_products_return(order_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_products_return_customer_id ON ec_order_products_return(customer_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_products_return_item_id ON ec_order_products_return(item_id)`);
      
      console.log("✅ Table 'ec_order_products_return' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_order_products_return':", err.message);
    }

    // Table: ec_order_products_return_logs
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_order_products_return_logs (
          products_return_id SERIAL PRIMARY KEY,
          exchange_refund_primary_key INT NOT NULL DEFAULT 0,
          created_by INT NOT NULL DEFAULT 0,
          created_by_name VARCHAR(255) DEFAULT NULL,
          user_id INT NOT NULL DEFAULT 0,
          user_name VARCHAR(255) DEFAULT NULL,
          user_email VARCHAR(255) DEFAULT NULL,
          product_price_id INT NOT NULL DEFAULT 0,
          item_id INT NOT NULL DEFAULT 0,
          item_title VARCHAR(255) DEFAULT NULL,
          item_alias VARCHAR(255) DEFAULT NULL,
          item_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_quantity DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_shipping_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_final_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          order_id INT NOT NULL DEFAULT 0,
          order_status VARCHAR(255) DEFAULT NULL,
          order_product_id INT NOT NULL DEFAULT 0,
          customer_id INT NOT NULL DEFAULT 0,
          customer_name VARCHAR(255) DEFAULT NULL,
          customer_email VARCHAR(255) DEFAULT NULL,
          customer_contact VARCHAR(255) DEFAULT NULL,
          exchange_refund VARCHAR(255) DEFAULT NULL,
          exchange_refund_reason VARCHAR(255) DEFAULT NULL,
          exchange_refund_description TEXT DEFAULT NULL,
          admin_approved VARCHAR(1) NOT NULL DEFAULT 'N',
          admin_notes TEXT DEFAULT NULL,
          admin_approve_date TIMESTAMP DEFAULT NULL,
          photo_1 VARCHAR(255) DEFAULT NULL,
          photo_2 VARCHAR(255) DEFAULT NULL,
          photo_3 VARCHAR(255) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT NULL
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_return_logs_order_id ON ec_order_products_return_logs(order_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_return_logs_customer_id ON ec_order_products_return_logs(customer_id)`);
      
      console.log("✅ Table 'ec_order_products_return_logs' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_order_products_return_logs':", err.message);
    }

    // Table: ec_order_status
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_order_status (
          order_status_id SERIAL PRIMARY KEY,
          order_id INT NOT NULL,
          order_status VARCHAR(255) DEFAULT NULL,
          updated_status VARCHAR(255) DEFAULT NULL,
          updated_by INT NOT NULL DEFAULT 0,
          updated_by_name VARCHAR(255) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_order_status_order_id ON ec_order_status(order_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_order_status_updated_status ON ec_order_status(updated_status)`);
      
      console.log("✅ Table 'ec_order_status' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_order_status':", err.message);
    }

    // Table: ec_products
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_products (
          item_id SERIAL PRIMARY KEY,
          user_id INT NOT NULL DEFAULT 0,
          pos_user VARCHAR(1) NOT NULL DEFAULT 'N',
          item_title VARCHAR(255) DEFAULT NULL,
          item_alias VARCHAR(255) UNIQUE DEFAULT NULL,
          item_code VARCHAR(255) DEFAULT NULL,
          parent_item_id INT NOT NULL DEFAULT 0,
          item_type_alias VARCHAR(255) DEFAULT NULL,
          item_section_alias VARCHAR(255) DEFAULT NULL,
          item_category_alias VARCHAR(255) DEFAULT NULL,
          item_tags_alias VARCHAR(255) DEFAULT NULL,
          item_format_alias VARCHAR(255) DEFAULT NULL,
          item_template_name VARCHAR(255) DEFAULT NULL,
          item_weight DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          is_download_product VARCHAR(1) NOT NULL DEFAULT 'N',
          is_free_product VARCHAR(1) NOT NULL DEFAULT 'N',
          in_stock VARCHAR(1) NOT NULL DEFAULT 'Y',
          currency VARCHAR(20) DEFAULT NULL,
          item_shipping_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          comment_count INT NOT NULL DEFAULT 0,
          item_description TEXT DEFAULT NULL,
          item_short_description VARCHAR(1024) DEFAULT NULL,
          item_terms_conditions VARCHAR(1024) DEFAULT NULL,
          meta_title VARCHAR(255) DEFAULT NULL,
          meta_description TEXT DEFAULT NULL,
          publish_date DATE DEFAULT NULL,
          publish_end_date DATE DEFAULT NULL,
          user_name VARCHAR(255) DEFAULT NULL,
          user_email VARCHAR(255) DEFAULT NULL,
          file1 VARCHAR(255) DEFAULT NULL,
          file2 VARCHAR(255) DEFAULT NULL,
          file3 VARCHAR(255) DEFAULT NULL,
          total_visit INT DEFAULT 0,
          internal_link VARCHAR(255) DEFAULT NULL,
          external_link VARCHAR(255) DEFAULT NULL,
          is_featured VARCHAR(1) NOT NULL DEFAULT 'N',
          is_home VARCHAR(1) NOT NULL DEFAULT 'N',
          is_sidebar VARCHAR(1) NOT NULL DEFAULT 'N',
          is_returnable VARCHAR(1) NOT NULL DEFAULT 'Y',
          top_ranked VARCHAR(1) NOT NULL DEFAULT 'N',
          highest_rated VARCHAR(1) NOT NULL DEFAULT 'N',
          most_viewed VARCHAR(1) NOT NULL DEFAULT 'N',
          related_products VARCHAR(255) DEFAULT NULL,
          total_sold INT NOT NULL DEFAULT 0,
          is_taxable VARCHAR(1) NOT NULL DEFAULT 'N',
          pos_online SMALLINT NOT NULL DEFAULT 0,
          item_css_class VARCHAR(255) DEFAULT NULL,
          display_on_sitemap VARCHAR(1) NOT NULL DEFAULT 'N',
          display_order INT NOT NULL DEFAULT 0,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          site_id INT NOT NULL DEFAULT 0,
          deleted_user_id INT NOT NULL DEFAULT 0,
          deleted_by_name VARCHAR(255) DEFAULT NULL,
          deleted_time VARCHAR(255) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          total_reviews INT NOT NULL DEFAULT 0,
          avg_ratings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          has_options VARCHAR(1) NOT NULL DEFAULT 'N',
          total_visitors INT NOT NULL DEFAULT 0
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_ec_products_user_id ON ec_products(user_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_ec_products_display_status ON ec_products(display_status)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_ec_products_item_type_alias ON ec_products(item_type_alias)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_ec_products_item_code ON ec_products(item_code)`);
      
      console.log("✅ Table 'ec_products' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_products':", err.message);
    }

    // Table: ec_product_price
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_product_price (
          product_price_id SERIAL PRIMARY KEY,
          item_id INT NOT NULL DEFAULT 0,
          user_id INT NOT NULL DEFAULT 0,
          product_attribute_1 VARCHAR(255) DEFAULT NULL,
          product_attribute_2 VARCHAR(255) DEFAULT NULL,
          product_attribute_3 VARCHAR(255) DEFAULT NULL,
          product_option_1 VARCHAR(255) DEFAULT NULL,
          product_option_2 VARCHAR(255) DEFAULT NULL,
          product_option_3 VARCHAR(255) DEFAULT NULL,
          product_option_4 INT NOT NULL DEFAULT 0,
          product_option_price DECIMAL(10,2) DEFAULT NULL,
          product_option_price_display DECIMAL(10,2) DEFAULT NULL,
          currency VARCHAR(255) DEFAULT NULL,
          item_tax_amount DECIMAL(10,2) DEFAULT 0.00,
          min_quantity_notification SMALLINT NOT NULL DEFAULT 0,
          item_shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          is_default_price VARCHAR(1) NOT NULL DEFAULT 'N',
          product_quantity INT NOT NULL DEFAULT 0,
          special_price_from_date DATE DEFAULT NULL,
          special_price_to_date DATE DEFAULT NULL,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          site_id SMALLINT NOT NULL DEFAULT 0
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_product_price_item_id ON ec_product_price(item_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_product_price_display_status ON ec_product_price(display_status)`);
      
      console.log("✅ Table 'ec_product_price' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_product_price':", err.message);
    }

    // Table: ec_product_price_log
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_product_price_log (
          product_price_log_id SERIAL PRIMARY KEY,
          product_price_id INT NOT NULL DEFAULT 0,
          item_id INT NOT NULL DEFAULT 0,
          item_title VARCHAR(255) DEFAULT NULL,
          user_id INT NOT NULL DEFAULT 0,
          product_option_price DECIMAL(10,2) DEFAULT NULL,
          product_option_price_old DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          product_option_price_display DECIMAL(10,2) DEFAULT NULL,
          product_option_price_display_old DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_tax_amount DECIMAL(10,2) DEFAULT 0.00,
          item_tax_amount_old INT NOT NULL DEFAULT 0,
          item_shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          item_shipping_amount_old DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          is_default_price VARCHAR(1) NOT NULL DEFAULT 'N',
          product_quantity INT NOT NULL DEFAULT 0,
          product_quantity_old INT NOT NULL DEFAULT 0,
          login_id INT NOT NULL DEFAULT 0,
          login_name VARCHAR(255) DEFAULT NULL,
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          created_at TIMESTAMP DEFAULT NULL
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_price_log_product_price_id ON ec_product_price_log(product_price_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_price_log_item_id ON ec_product_price_log(item_id)`);
      
      console.log("✅ Table 'ec_product_price_log' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_product_price_log':", err.message);
    }

    // Table: ec_product_reviews
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_product_reviews (
          product_review_id SERIAL PRIMARY KEY,
          item_id INT NOT NULL DEFAULT 0,
          item_alias VARCHAR(255) DEFAULT NULL,
          customer_id INT NOT NULL DEFAULT 0,
          customer_name VARCHAR(255) DEFAULT NULL,
          customer_email VARCHAR(255) DEFAULT NULL,
          customer_phone VARCHAR(255) DEFAULT NULL,
          ratings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          review_text TEXT DEFAULT NULL,
          display_status VARCHAR(1) NOT NULL DEFAULT 'P',
          site_id SMALLINT NOT NULL DEFAULT 0,
          deleted_date DATE DEFAULT NULL,
          deleted_user_id INT NOT NULL DEFAULT 0,
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_product_reviews_item_id ON ec_product_reviews(item_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_product_reviews_customer_id ON ec_product_reviews(customer_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_product_reviews_display_status ON ec_product_reviews(display_status)`);
      
      console.log("✅ Table 'ec_product_reviews' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_product_reviews':", err.message);
    }

    // Table: ec_product_specifications
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_product_specifications (
          product_specification_id SERIAL PRIMARY KEY,
          item_id INT NOT NULL DEFAULT 0,
          item_alias VARCHAR(255) DEFAULT NULL,
          specification_title VARCHAR(255) DEFAULT NULL,
          specification_value VARCHAR(255) DEFAULT NULL,
          specification_type VARCHAR(255) DEFAULT NULL,
          site_id SMALLINT NOT NULL DEFAULT 0,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_specifications_item_id ON ec_product_specifications(item_id)`);
      
      console.log("✅ Table 'ec_product_specifications' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_product_specifications':, err.message");
    }

    // Table: ec_search_terms
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_search_terms (
          search_terms_id SERIAL PRIMARY KEY,
          keyword VARCHAR(255) UNIQUE DEFAULT NULL,
          search_count INT NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT NULL
        )
      `;
      await query(sqlQuery);
      
      console.log("✅ Table 'ec_search_terms' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_search_terms':", err.message);
    }

    // Table: ec_search_terms_logs
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_search_terms_logs (
          search_terms_id SERIAL PRIMARY KEY,
          keyword VARCHAR(255) DEFAULT NULL,
          search_count INT NOT NULL DEFAULT 0,
          is_web VARCHAR(1) NOT NULL DEFAULT 'N',
          ip_address VARCHAR(45) DEFAULT NULL,
          customer_id INT NOT NULL DEFAULT 0,
          customer_name VARCHAR(255) DEFAULT NULL,
          customer_email VARCHAR(255) DEFAULT NULL,
          browser VARCHAR(1024) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_search_logs_keyword ON ec_search_terms_logs(keyword)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_search_logs_customer_id ON ec_search_terms_logs(customer_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON ec_search_terms_logs(created_at)`);
      
      console.log("✅ Table 'ec_search_terms_logs' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_search_terms_logs':", err.message);
    }

    // Table: ec_wishlist
    try {
      let sqlQuery = `
        CREATE TABLE IF NOT EXISTS ec_wishlist (
          wishlist_id SERIAL PRIMARY KEY,
          customer_id INT NOT NULL DEFAULT 0,
          item_id INT NOT NULL DEFAULT 0,
          product_price_id INT NOT NULL DEFAULT 0,
          site_id INT NOT NULL DEFAULT 0,
          display_status VARCHAR(1) NOT NULL DEFAULT 'Y',
          deleted_status VARCHAR(1) NOT NULL DEFAULT 'N',
          created_at TIMESTAMP DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT customer_item_unique UNIQUE (customer_id, item_id)
        )
      `;
      await query(sqlQuery);
      
      await query(`CREATE INDEX IF NOT EXISTS idx_wishlist_customer_id ON ec_wishlist(customer_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_wishlist_item_id ON ec_wishlist(item_id)`);
      
      console.log("✅ Table 'ec_wishlist' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'ec_wishlist':", err.message);
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
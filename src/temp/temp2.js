try {
    let sqlQuery = `
        CREATE TABLE IF NOT EXISTS action (
            action_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            record_id INT NOT NULL DEFAULT 0,
            table_name VARCHAR(255) DEFAULT NULL,
            record_name VARCHAR(255) DEFAULT NULL,
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
        )`;
      await query(sqlQuery);
      console.log("✅ Table 'action' created successfully");
    } catch (err) {
      console.error("❌ Failed to create table 'action':", err.message);
    }
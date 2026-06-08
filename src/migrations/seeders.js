const db = require('../../connection');
const util = require("util");
const query = util.promisify(db.query).bind(db);

async function seed() {
  console.log("Starting database seeding...\n");
  const now = new Date();

  // ==================== SEED USERS TABLE ====================
  try {
    const checkUsersQuery = `SELECT COUNT(*)::int as count FROM users`;
    const checkUsersResult = await query(checkUsersQuery);
    if (checkUsersResult.rows[0].count === 0) {
      const usersSql = `
        INSERT INTO users (
          site_id, site_db, user_firstname, user_lastname, user_name, 
          user_email, user_password, user_token, user_photo, user_role_id, 
          is_developer_account, allow_delete, created_by, created_by_name, 
          created_by_role, web_or_app, active_status, display_status, deleted_status, 
          created_at, updated_at, add_1
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
      `;
      const usersValues = [
        [1, 'nodejsframework', 'Developer', 'Account', 'developer', 'developer112018@yopmail.com', '$2a$10$UISTV//uhMD7OzURd9rxDOM5IrLAPAjVtb/saPfYqIjGCATQl7Tuq', '', null, 1, 'Y', 'N', 0, null, 0, 'Web', 'Y', 'Y', 'N', now, now, null],
        [1, 'nodejsframework', 'Super', 'Admin', 'cloudswiftsolutions', 'cloudswiftsolutions@gmail.com', '$2a$10$kJTPNZHNRH8L.YWfYLqsX.eZNpNRvzW/6ZnqD0nauEpxObP2kDw26', null, null, 2, 'N', 'N', 0, null, 0, 'App', 'Y', 'Y', 'N', now, now, null]
      ];
      for (const user of usersValues) await query(usersSql, user);
      console.log("✅ Seeded 'users' table with", usersValues.length, "records");
    } else {
      console.log("⚠️ 'users' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'users' table:", err);
  }

  // ==================== SEED SITE_CONFIG_PARENT TABLE ====================
  try {
    const checkConfigParentQuery = `SELECT COUNT(*)::int as count FROM site_config_parent`;
    const checkConfigParentResult = await query(checkConfigParentQuery);
    if (checkConfigParentResult.rows[0].count === 0) {
      const configParentSql = `
        INSERT INTO site_config_parent (
          site_id, site_config_title, display_order, display_status, classname, deleted_status, root_user_only, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `;
      const configParentValues = [
        [0, 'Frontend Settings', 1, 'Y', 'collapseOne', 'N', 'N', null, null],
        [0, 'Backend Settings', 2, 'Y', 'collapseTwo', 'N', 'N', null, null],
        [0, 'SEO Settings', 3, 'Y', 'collapseThree', 'N', 'N', null, null],
        [0, 'Security Settings', 4, 'Y', 'collapseFour', 'N', 'Y', null, null],
        [0, 'Site Details', 7, 'Y', 'collapseSeven', 'N', 'N', null, null],
        [0, 'Privacy Settings', 9, 'Y', 'collapseNine', 'N', 'Y', null, null],
        [0, 'Follow Us', 10, 'Y', 'collapseTen', 'N', 'Y', null, null],
        [0, 'Email Settings', 8, 'Y', 'collapseEight', 'N', 'N', null, null]
      ];
      for (const row of configParentValues) await query(configParentSql, row);
      console.log("✅ Seeded 'site_config_parent' table");
    } else {
      console.log("⚠️ Already seeded");
    }
  } catch (err) {
    console.error("❌ Failed:", err);
  }

  // ==================== SEED SITE_CONFIG TABLE ====================
  try {
    const checkConfigQuery = `SELECT COUNT(*)::int as count FROM site_config`;
    const checkConfigResult = await query(checkConfigQuery);
    if (checkConfigResult.rows[0].count === 0) {
      const configSql = `
        INSERT INTO site_config (
          site_id, config_title, config_name, config_value, input_type, size, maxlength, input_type_title, classname, required,
          display_order, comments, display_status, additional, display_on_dashboard, display_on_third_party, site_config_parent_id,
          deleted_status, root_user_only, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
      `;
      const configValues = [
        [0, 'Application Title', 'FRONT_APPLICATION_TITLE', 'CMS123', 'text', 100, 100, 'Please enter your application name for display on frontend side as title', 'form-control', 'Y', 1, null, 'Y', null, 'Y', 'Y', 1, 'N', 'N', '2019-04-11 13:00:00', '2026-01-30 09:34:40'],
        [0, 'Records per page', 'FRONT_RECORD_PER_PAGE', '16', 'select', 100, 60, 'Records per page', 'form-control', 'Y', 5, '8@=16@=24@=32@=40@=80', 'Y', null, 'Y', 'Y', 1, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [0, 'Maintenance Mode', 'SITE_CONSTRUCTION', 'No', 'select', 100, 60, 'Site Under Construction Status', 'form-control', 'Y', 12, 'Yes@=No', 'Y', null, 'Y', 'N', 1, 'N', 'N', '2019-04-11 13:00:00', '2021-12-07 22:07:04'],
        [0, 'Default Timezone', 'FRONT_DEFAULT_TIMEZONE', 'Asia/Kolkata', 'select', 100, 60, 'Default Timezone', 'form-control', 'Y', 13, 'America/Chicago@=Asia/Kolkata@=Europe/London@=Australia/Perth', 'Y', null, 'Y', 'Y', 1, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [0, 'Backend application Title', 'BACKEND_APPLICATION_TITLE', 'Cloudswift :: Administrator', 'text', 100, 60, 'Application Title', 'form-control', 'Y', 14, null, 'Y', null, 'Y', 'N', 2, 'N', 'N', '2019-04-11 13:00:00', '2019-10-14 07:08:57'],
        [0, 'Meta Description', 'FRONT_META_DESCRIPTION', 'We are the leading Custom Software Solution Company in Vadodara, Gujarat, India who servered more then 50 Clients across World.', 'text', 100, 60, 'Meta Description', 'form-control', 'Y', 1, null, 'Y', null, 'N', 'N', 1, 'N', 'N', '2019-04-11 13:00:00', '2020-04-17 01:06:07'],
        [0, 'Default Robots', 'FRONT_DEFAULT_ROBOTS', 'INDEX,FOLLOW', 'select', 100, 60, 'Default Robots', 'form-control', 'Y', 25, 'INDEX,FOLLOW@=NOINDEX@=NOFOLLOW@=NOINDEX,NOFOLLOW', 'Y', null, 'Y', 'Y', 3, 'N', 'N', '2019-04-11 13:00:00', '2019-10-17 08:06:12'],
        [0, 'Company Name', 'COMPANY_NAME', 'Demonstration Project Pvt. Ltd.', 'text', 100, 60, 'Company Name', 'form-control', 'Y', 64, null, 'Y', null, 'N', 'Y', 5, 'N', 'N', '2019-04-11 13:00:00', '2019-11-07 22:26:19'],
        [0, 'Company Address', 'COMPANY_ADDRESS1', 'Sama, Near Chanikya crossing', 'text', 100, 60, 'Company Address', 'form-control', 'Y', 65, null, 'Y', null, 'N', 'Y', 5, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [0, 'Company Address 2', 'COMPANY_ADDRESS2', '', 'text', 100, 60, 'Company Address 2', 'form-control', 'Y', 66, null, 'Y', null, 'N', 'Y', 5, 'N', 'N', '2019-04-11 13:00:00', '2019-09-24 08:43:53'],
        [0, 'City', 'COMPANY_CITY', 'Vadodara', 'text', 100, 60, 'City', 'form-control', 'Y', 67, null, 'Y', null, 'N', 'Y', 5, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [0, 'State', 'COMPANY_STATE', 'GJ', 'text', 100, 60, 'State', 'form-control', 'Y', 68, null, 'Y', null, 'N', 'Y', 5, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [0, 'Country', 'COMPANY_COUNTRY', 'INN', 'text', 100, 60, 'Country', 'form-control', 'Y', 69, null, 'Y', null, 'N', 'Y', 5, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [0, 'Zipcode', 'COMPANY_ZIPCODE', '390009', 'text', 100, 60, 'Zipcode', 'form-control', 'Y', 70, 'max six digits', 'Y', null, 'N', 'Y', 5, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [0, 'Contact Number', 'COMPANY_CONTACT_NUMBER', '886-630-3621', 'text', 100, 60, 'Contact Number', 'form-control', 'Y', 71, null, 'Y', null, 'N', 'Y', 5, 'N', 'N', '2019-04-11 13:00:00', '2020-04-13 11:50:21'],
        [0, 'Contact us email address', 'COMPANY_EMAIL', 'connect@cloudswiftsolutions.com', 'email', 100, 60, 'Contact us email address', 'form-control', 'Y', 74, null, 'Y', null, 'N', 'Y', 8, 'N', 'N', '2019-04-11 13:00:00', '2021-08-13 00:40:23'],
        [0, 'Contact us person name', 'COMPANY_CONTACT_PERSON', 'Demonstration Project', 'text', 100, 60, 'Contact us person name', 'form-control', 'Y', 75, null, 'Y', null, 'N', 'Y', 8, 'N', 'N', '2019-04-11 13:00:00', '2021-08-13 01:15:54'],
        [0, 'Allow Sending emails', 'ALLOW_SENDING_EMAIL', 'Yes', 'select', 100, 5, 'Allow to send email throughout site? If no, not a single email will execute in this project.', 'form-control', 'Y', 82, 'Yes@=No', 'Y', null, 'N', 'N', 8, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [0, 'Order email name', 'ORDER_CONTACT_PERSON', 'Cloud Swift Solutions', 'text', 100, 60, 'order person name', 'form-control', 'Y', 75, null, 'Y', null, 'N', 'N', 8, 'N', 'N', '2019-04-11 13:00:00', '2019-11-18 20:14:30'],
        [0, 'From email address', 'FROM_EMAIL_ADDRESS', 'notifications@cloudswiftsolutions.com', 'email', 100, 60, 'from email address', 'form-control', 'Y', 74, null, 'Y', null, 'N', 'Y', 8, 'N', 'N', '2019-04-11 13:00:00', '2021-06-21 21:54:54'],
        [0, 'Backend Logo title display', 'BACKEND_LOGO_TITLE_DISPLAY', 'Administrator', 'text', 100, 60, 'backend_logo_title_display', 'form-control', 'Y', 8, '', 'Y', null, 'N', 'Y', 2, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [0, 'Content to display before end of body tag', 'CONTENT_BEFORE_BODY_TAG', '', 'textarea', 100, 6000, 'Please enter content that will before close of body tag.', 'form-control', 'N', 26, null, 'Y', null, 'N', 'Y', 6, 'N', 'N', '2019-04-11 13:00:00', '2019-09-24 09:24:46'],
        [0, 'Script after begin head tag', 'AFTER_HEAD_TAG', '', 'text', 100, 60, 'After head tag javacript script', 'form-control', 'N', 39, null, 'Y', null, 'N', 'Y', 3, 'N', 'N', '2019-04-11 13:00:00', '2019-09-24 08:43:53'],
        [0, 'Application json script', 'APPLICATION_JSON_SCRIPT', '', 'textarea', 100, 6000, 'Application json script', 'form-control', 'N', 26, null, 'Y', null, 'N', 'Y', 3, 'N', 'N', '2019-04-11 13:00:00', '2019-09-24 09:24:46'],
        [0, 'Upload Max Size', 'UPLOAD_MAX_FILESIZE', '2M', 'select', 100, 60, 'Upload Max Size', 'form-control', 'Y', 44, '2M@=8M@=16M@=24M', 'Y', null, 'N', 'N', 4, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [0, 'Facebook', 'FACEBOOK_URL', 'https://www.facebook.com/cloudswiftsolutions/', 'text', 100, 60, 'Please enter your facebook page url', 'form-control', 'N', 40, null, 'Y', null, 'N', 'Y', 7, 'N', 'N', '2019-04-11 13:00:00', '2019-10-14 07:58:52'],
        [0, 'Twitter', 'TWITTER_URL', 'https://twitter.com/cloudswiftsolutions', 'text', 100, 60, 'Please enter your twitter page url', 'form-control', 'N', 40, null, 'Y', null, 'N', 'Y', 7, 'N', 'N', '2019-04-11 13:00:00', '2019-10-14 07:59:00'],
        [0, 'Linkedin', 'LINKEDIN_URL', 'https://www.linkedin.com/company/cloudswiftsolutions/', 'text', 100, 60, 'Please enter your Linkedin page url', 'form-control', 'N', 40, null, 'Y', null, 'N', 'Y', 7, 'N', 'N', '2019-04-11 13:00:00', '2019-10-14 07:59:06'],
        [0, 'Allow to sent email to admin for contact,feedback,etc.', 'ALLOW_CONTACT_EMAIL', 'Y', 'select', 100, 60, 'Please select option', 'form-control', 'Y', 5, 'Y@=N', 'Y', null, 'Y', 'N', 8, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [0, 'Application Name', 'FRONT_APPLICATION_NAME', 'Demonstration Project', 'text', 100, 100, 'Please enter your application name for display on frontend side as name', 'form-control', 'Y', 1, null, 'Y', null, 'Y', 'Y', 1, 'N', 'N', '2019-04-11 18:30:00', '2019-10-14 13:22:59'],
        [0, 'Closed Store Status', 'CLOSED_STORE_STATUS', 'N', 'select', 100, 100, 'This store is closed at present.', 'form-control', 'Y', 1, 'Y@=N', 'Y', null, 'Y', 'Y', 1, 'N', 'N', '2019-04-11 18:30:00', '2021-08-02 10:54:46'],
        [0, 'Closed Store Message', 'CLOSED_STORE_MESSAGE', 'Store is Under Construction', 'text', 100, 100, 'Closed Store Message', 'form-control', 'Y', 1, null, 'Y', null, 'Y', 'Y', 1, 'N', 'N', '2019-04-11 18:30:00', '2021-08-02 10:52:45'],
        [0, 'BCC Email 1', 'BCC_EMAIL_1', 'bcc', 'email', 100, 60, 'BCC Email', 'form-control', 'Y', 74, null, 'Y', null, 'N', 'Y', 8, 'N', 'N', '2019-04-11 18:30:00', '2026-01-29 15:39:46'],
        [0, 'SMTP HOST', 'SMTP_HOST', 'smtp.hostinger.com', 'text', 100, 60, 'SMTP HOST', 'form-control', 'Y', 74, null, 'Y', null, 'N', 'Y', 8, 'N', 'N', '2019-04-11 18:30:00', '2021-08-13 06:20:26'],
        [0, 'SMTP PORT', 'SMTP_PORT', '587', 'text', 100, 60, 'SMTP Port', 'form-control', 'Y', 74, null, 'Y', null, 'N', 'Y', 8, 'N', 'N', '2019-04-11 18:30:00', '2023-09-16 22:32:56'],
        [0, 'SMTP PASSWORD', 'SMTP_PASSWORD', 'Cloud@112018', 'email', 100, 60, 'SMTP PASSWORD', 'form-control', 'Y', 74, null, 'Y', null, 'N', 'Y', 8, 'N', 'N', '2019-04-11 18:30:00', '2021-08-13 06:20:26']
      ];
      for (const config of configValues) await query(configSql, config);
      console.log("✅ Seeded 'site_config' table with", configValues.length, "records");
    } else {
      console.log("⚠️ 'site_config' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'site_config' table:", err);
  }

  // ==================== SEED ROLE_ACCESS TABLE ====================
  try {
    const checkRoleAccessQuery = `SELECT COUNT(*)::int as count FROM role_access`;
    const checkRoleAccessResult = await query(checkRoleAccessQuery);
    if (checkRoleAccessResult.rows[0].count === 0) {
      const roleAccessSql = `
        INSERT INTO role_access (
          site_id, role_id, module_id, grant_add, grant_edit, grant_delete, grant_view, display_order, display_status, deleted_status, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      `;
      const roleAccessValues = [
        [0, 1, 1, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 2, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 3, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 4, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 5, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 8, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 10, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 15, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 22, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 23, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 24, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 26, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 27, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 28, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 29, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 30, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now],
        [0, 1, 31, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', now, now]
      ];
      for (const row of roleAccessValues) await query(roleAccessSql, row);
      console.log("✅ Seeded 'role_access' table with", roleAccessValues.length, "records");
    } else {
      console.log("⚠️ 'role_access' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'role_access' table:", err);
  }

  // ==================== SEED ROLE TABLE ====================
  try {
    const checkRoleQuery = `SELECT COUNT(*)::int as count FROM role`;
    const checkRoleResult = await query(checkRoleQuery);
    if (checkRoleResult.rows[0].count === 0) {
      const roleSql = `
        INSERT INTO role (
          site_id, role_title, item_alias, item_type, display_order, display_status, display_on_listing, show_action_checkbox, allow_delete,
          created_by, deleted_status, deleted_by, deleted_by_name, deleted_time, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      `;
      const roleValues = [
        [0, 'Developer', 'developer', 'role', 1, 'Y', 'Y', 'Y', 'N', 0, 'N', 0, null, null, now, now],
        [0, 'Super Admin', 'superadmin', 'role', 1, 'Y', 'Y', 'Y', 'N', 0, 'N', 0, null, null, now, now],
        [0, 'Admin', 'admin', 'role', 1, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, now, now]
      ];
      for (const row of roleValues) await query(roleSql, row);
      console.log("✅ Seeded 'role' table with", roleValues.length, "records");
    } else {
      console.log("⚠️ 'role' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'role' table:", err);
  }

  // ==================== SEED META_DETAILS TABLE ====================
  try {
    const checkMetaDetailsQuery = `SELECT COUNT(*)::int as count FROM meta_details`;
    const checkMetaDetailsResult = await query(checkMetaDetailsQuery);
    if (checkMetaDetailsResult.rows[0].count === 0) {
      const metaDetailsSql = `
        INSERT INTO meta_details (
          site_id, parent_id, end_points, page_title, meta_title, meta_description, sidebar_title, sidebar_icon, sidebar_order, params, is_module, deleted_status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      `;
      const metaDetailsValues = [
        [0, 0, '/', 'Dashboard', 'Dashboard', 'Dashboard', 'Dashboard', 'mdi-view-dashboard', 1, null, 1, 'N'],
        [0, 0, '/users', 'Users', 'Users', 'Users', 'Users', 'mdi-account-box', 104, null, 1, 'N'],
        [0, 0, '/change-password', 'Change Password', 'Change Password', 'Change Password', 'Change Password', 'mdi mdi-server-security', 105, null, 1, 'N'],
        [0, 0, '/items?item_type=page', 'Pages', 'Pages', 'Pages', 'Pages', 'mdi-format-list-bulleted', 3, null, 1, 'N'],
        [0, 0, '/configurations', 'Configurations', 'Configurations Meta', 'Desc', 'Configurations', 'mdi-view-headline', 109, null, 1, 'N'],
        [0, 0, '/user_form', 'User Form', 'User Form', 'User Form', 'User Form', null, 0, null, 0, 'N'],
        [0, 0, '/item_section_form', 'Section Form', 'Section Form', 'Section Form', 'Section Form', null, 0, null, 0, 'N'],
        [0, 0, '/logout', 'Logout', 'Logout', 'Logout', 'Logout', 'mdi-logout-variant', 201, null, 1, 'N'],
        [0, 0, '/login', 'Login', 'Login', 'Login', 'Login', null, 0, null, 0, 'N'],
        [0, 0, '/metadetails', 'Meta Details', 'Meta Details', 'Meta Details', 'SEO', 'mdi-format-list-bulleted', 108, null, 1, 'N'],
        [0, 0, '/item_form', 'Item Form', 'Item Form', 'Item Form', 'Item Form', null, 0, null, 0, 'N'],
        [0, 0, '/forgot-password', 'Forgot Password', 'Forgot Password', 'Forgot Password', 'Forgot Password', null, 0, null, 0, 'N'],
        [0, 0, '/password-token', 'Password Token', 'Password Token', 'Password Token', 'Password Token', null, 0, null, 0, 'N'],
        [0, 0, '/reset-password', 'Reset Password', 'Reset Password', 'Reset Password', 'Reset Password', null, 0, null, 0, 'N'],
        [0, 0, '/roles', 'Roles', 'Roles', 'Roles', 'Roles', 'mdi mdi-account', 103, null, 1, 'N'],
        [0, 0, '/role_form', 'Role Form', 'Role Form', 'Role Form', 'Role Form', null, 0, null, 0, 'N'],
        [0, 0, '/item_form?item_type=blog', 'Blog Form', 'Blog Form', 'Blog Form', null, null, 0, null, 0, 'N'],
        [0, 0, '/item_form?item_type=page', 'Page Form', 'Page Form', 'Page Form', null, null, 0, null, 0, 'N'],
        [0, 0, '/item_section_form?item_type=default', 'Default Section Form', 'Default Section Form', 'Default Section Form', null, null, 0, null, 0, 'N'],
        [0, 0, '/item_section_form?item_type=blog', 'Blog Category Form', 'Blog Category Form', 'Blog Category Form', null, null, 0, null, 0, 'N'],
        [0, 0, '/items/default', 'Demonstration Company', 'Demonstration Company', 'Demonstration Company Description', null, null, 0, null, 0, 'N'],
        [0, 0, '/database_table', 'Database Tables', 'Database Tables', 'Database Tables', 'Database Tables', 'mdi mdi-view-headline', 200, null, 1, 'N'],
        [0, 0, '/item_section?item_type=blog', 'Blog Category', 'Blog Category', 'Blog Category', 'Blog Category', 'mdi mdi-view-headline', 5, null, 1, 'N'],
        [0, 0, '/items?item_type=blog', 'Blogs', 'Blogs', 'Blogs', 'Blogs', 'mdi-format-list-bulleted', 5, null, 1, 'N'],
        [0, 0, '/item_form?item_type=default', 'Default Form', 'Default Form', 'Default Form', null, null, 0, null, 0, 'N'],
        [0, 0, '/item_section?item_type=default', 'Default Section', 'Default Section', 'Default', 'Default Section', 'mdi mdi-view-headline', 1, null, 1, 'N'],
        [0, 0, '/items?item_type=default', 'Default Item', 'Default', 'Default', 'Default Items', 'mdi-format-list-bulleted', 1, null, 1, 'N'],
        [0, 52, '/template/mdiicons', 'Demonstration Company', 'Demonstration Company', 'Demonstration Company Description', 'MDI Icons', 'mdi mdi-view-headline', 404, 'ui-basic', 1, 'Y'],
        [0, 52, '/template/formelement', 'Form Elements', 'Form Elements', 'Form Elements', 'Form Element', 'mdi mdi-view-headline', 403, 'ui-basic', 1, 'Y'],
        [0, 52, '/template/gallery', 'Gallery', 'Gallery', 'Gallery', 'Gallery', 'mdi mdi-view-headline', 402, 'ui-basic', 1, 'Y'],
        [0, -1, '/template', 'Templates', 'Templates', 'Templates', 'Templates', 'ui-basic', 401, null, 1, 'Y'],
        [0, 0, '/items', 'Demonstration Company', 'Demonstration Company', 'Demonstration Company Description', null, null, 0, null, 0, 'N']
      ];
      for (const row of metaDetailsValues) await query(metaDetailsSql, row);
      console.log("✅ Seeded 'meta_details' table with", metaDetailsValues.length, "records");
    } else {
      console.log("⚠️ 'meta_details' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'meta_details' table:", err);
  }

  // ==================== SEED ITEMS TABLE ====================
  try {
    const checkItemsQuery = `SELECT COUNT(*)::int as count FROM items`;
    const checkItemsResult = await query(checkItemsQuery);
    if (checkItemsResult.rows[0].count === 0) {
      const itemsSql = `
        INSERT INTO items (
          site_id, item_title, item_alias, item_parent, item_type, item_sections_id, item_description, attachment1, attachment2,
          item_shortdescription, user_id, controller, action, published_at, published_end_at, meta_title, meta_description, created_by,
          created_by_name, created_by_role, display_order, display_status, deleted_status, deleted_by, deleted_by_name, deleted_time, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28)
      `;
      const itemsValues = [
        [0, 'Home', 'home', 100, 'page', '24', 'description update', 'attachment1-1758612676875.png', 'attachment2-1758612676877.png', 'short description update', 3, 'controller', 'action', now, now, 'meta title update', 'meta description update', 1, 'Demonstration', 1, 1, 'Y', 'N', 0, null, null, now, now],
        [0, 'About Us', 'about-us', 0, 'page', null, 'About Us', null, '', '', 1, '', '', now, now, 'About Us', 'About Us', 1, 'Demonstration', 1, 1, 'Y', 'N', 0, null, null, now, now],
        [0, 'Terms & Conditions', 'terms-and-conditions', 0, 'page', null, 'Terms & Conditions', null, '', '', 1, '', '', now, now, 'Terms & Conditions', 'Terms & Conditions', 1, 'Demonstration', 1, 2, 'Y', 'N', 0, null, null, now, now],
        [0, 'Privacy Policy', 'privacy-policy', 0, 'page', null, 'Privacy Policy', null, '', '', 1, '', '', now, now, 'Privacy Policy', 'Privacy Policy', 1, 'Demonstration', 1, 3, 'Y', 'N', 0, null, null, now, now]
      ];
      for (const row of itemsValues) await query(itemsSql, row);
      console.log("✅ Seeded 'items' table with", itemsValues.length, "records");
    } else {
      console.log("⚠️ 'items' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'items' table:", err);
  }

  console.log("\n🌱 Database seeding completed!");
  await db.end();
  process.exit();
}

seed();

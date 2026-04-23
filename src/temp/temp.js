const db = require('../../connection');
const util = require("util");
const query = util.promisify(db.query).bind(db);

async function seed() {
  console.log("Starting database seeding...\n");

  // ==================== SEED USERS TABLE ====================
  try {
    const checkUsersQuery = `SELECT COUNT(*) as count FROM users`;
    const checkUsersResult = await query(checkUsersQuery);
    
    if (parseInt(checkUsersResult.rows[0].count) === 0) {
      const usersSql = `
        INSERT INTO users (
          user_id, site_id, site_db, user_firstname, user_lastname, user_name, 
          user_email, user_password, user_token, user_photo, user_role_id, 
          is_developer_account, allow_delete, created_by, created_by_name, 
          created_by_role, active_status, display_status, deleted_status, 
          created_at, updated_at, add_1
        ) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      `;
      
      const usersValues = [
        [1, 1, 'nodejsframework', 'Developer', 'Account', 'developer', 'developer112018@yopmail.com', '$2a$10$UISTV//uhMD7OzURd9rxDOM5IrLAPAjVtb/saPfYqIjGCATQl7Tuq', '', null, 1, 'Y', 'N', 0, null, 0, 'Y', 'Y', 'N', '2025-05-16 10:17:06', '2026-01-30 11:01:25', null],
        [2, 1, 'nodejsframework', 'Super', 'Admin', 'cloudswiftsolutions', 'cloudswiftsolutions@gmail.com', '$2a$10$kJTPNZHNRH8L.YWfYLqsX.eZNpNRvzW/6ZnqD0nauEpxObP2kDw26', null, null, 2, 'N', 'N', 0, null, 0, 'Y', 'Y', 'N', '2025-05-16 10:17:06', '2026-01-30 07:09:50', null],
        [3, 1, 'nodejsframework', 'Admin', 'Admin', null, 'admin112018@yopmail.com', '$2a$10$LtWMrprwz8Y4pD9uvw/bSOC6nY8rBeViBiN31EdIFGBS9wKOp6W4K', '', null, 3, 'N', 'Y', 0, null, 0, 'Y', 'Y', 'N', '2025-10-03 11:42:46', '2026-01-30 07:09:50', null],
        [4, 1, 'nodejsframework', 'Admin', 'User', null, 'adminuser1@yopmail.com', null, null, null, 3, 'N', 'Y', 3, null, 0, 'Y', 'Y', 'N', '2025-10-03 12:19:39', '2026-01-30 07:09:50', null],
        [5, 1, 'nodejsframework', 'Admin', 'User2', null, 'adminuser2@yopmail.com', null, null, null, 3, 'N', 'Y', 3, 'Admin Admin', 3, 'Y', 'Y', 'N', '2025-10-03 12:21:22', '2026-01-30 07:09:50', null],
        [6, 1, 'nodejsframework', 'tempuser', 'tempuser', null, 'mayankkkp@yopmail.com', null, null, 'user_photo-1769689790113.png', 1, 'N', 'Y', 1, 'Developer Account', 1, 'Y', 'Y', 'N', '2026-01-29 17:59:29', '2026-01-30 07:09:50', null],
        [7, 1, 'nodejsframework', 'mike', 'mikeee', null, 'mayankpppppp@yopmail.com', '$2a$10$3k4wyyWWjn3Nzrczb.l9nuoA2Y2y5J1yGnKGG5GYQiq1ldBzg7mC.', '', 'user_photo-1769702467644.png', 3, 'N', 'Y', 1, 'Developer Account', 1, 'Y', 'Y', 'N', '2026-01-29 21:30:51', '2026-01-30 07:09:50', null],
        [8, 0, null, 'fffffff', 'wwwwwww', null, 'fadf@yopmail.com', null, null, 'user_photo-1769762499350.png', 4, 'N', 'Y', 1, 'Developer Account', 1, 'Y', 'Y', 'N', '2026-01-30 14:11:23', '2026-01-30 08:41:39', null],
        [9, 0, null, ' fd fd  43 423 3 32 334 324', ' fd fd  43 423 3 32 334 324', null, 'a@a.com', null, null, null, 1, 'N', 'Y', 1, 'Developer Account', 1, 'Y', 'Y', 'N', '2026-01-30 15:02:17', '2026-01-30 09:32:29', null],
        [10, 0, null, 'mayank', 'patel', null, 'mayankp@yopmail.com', null, null, null, 1, 'N', 'Y', 1, 'Developer Account', 1, 'Y', 'Y', 'N', '2026-01-30 16:51:10', '2026-01-30 11:21:23', null],
        [11, 0, 'nodejsframework', '`\'"\\`~!@#$%^&*()_-+=[]{}|:;"\'<', '`\'"\\`~!@#$%^&*()_-+=[]{}|:;"\'<', null, '`\'"\\`~!@#$%^&*()_-+=[]{}|:;"\'<@afs.com', null, null, null, 1, 'N', 'Y', 1, 'Developer Account', 1, 'Y', 'Y', 'N', '2026-01-30 17:06:45', '2026-01-30 11:40:46', null],
        [12, 0, 'nodejsframework', '11223344', '11223344', null, 'sdfsf@yopmail.com', null, null, null, 1, 'N', 'Y', 1, 'Developer Account', 1, 'Y', 'Y', 'N', '2026-01-30 17:13:58', '2026-01-30 11:44:08', null]
      ];
      
      for (const user of usersValues) {
        await query(usersSql, user);
      }
      console.log("✅ Seeded 'users' table with", usersValues.length, "records");
    } else {
      console.log("⚠️ 'users' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'users' table:", err.message);
  }

  // ==================== SEED SITE_CONFIG_PARENT TABLE ====================
  try {
    const checkConfigParentQuery = `SELECT COUNT(*) as count FROM site_config_parent`;
    const checkConfigParentResult = await query(checkConfigParentQuery);
    
    if (parseInt(checkConfigParentResult.rows[0].count) === 0) {
      const configParentSql = `
        INSERT INTO site_config_parent (
          site_config_parent_id, site_id, site_config_title, display_order, 
          display_status, class, deleted_status, root_user_only, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      
      const configParentValues = [
        [1, 0, 'Frontend Settings', 1, 'Y', 'collapseOne', 'N', 'N', null, null],
        [2, 0, 'Backend Settings', 2, 'Y', 'collapseTwo', 'N', 'N', null, null],
        [3, 0, 'SEO Settings', 3, 'Y', 'collapseThree', 'N', 'N', null, null],
        [4, 0, 'Security Settings', 4, 'Y', 'collapseFour', 'N', 'Y', null, null],
        [7, 0, 'Site Details', 7, 'Y', 'collapseSeven', 'N', 'N', null, null],
        [8, 0, 'Email Settings', 8, 'Y', 'collapseEight', 'N', 'N', null, null],
        [9, 0, 'Privacy Settings', 9, 'Y', 'collapseNine', 'N', 'Y', null, null],
        [10, 0, 'Follow Us', 10, 'Y', 'collapseTen', 'N', 'Y', null, null]
      ];
      
      for (const configParent of configParentValues) {
        await query(configParentSql, configParent);
      }
      console.log("✅ Seeded 'site_config_parent' table with", configParentValues.length, "records");
    } else {
      console.log("⚠️ 'site_config_parent' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'site_config_parent' table:", err.message);
  }

  // ==================== SEED SITE_CONFIG TABLE ====================
  try {
    const checkConfigQuery = `SELECT COUNT(*) as count FROM site_config`;
    const checkConfigResult = await query(checkConfigQuery);
    
    if (parseInt(checkConfigResult.rows[0].count) === 0) {
      const configSql = `
        INSERT INTO site_config (
          config_id, site_id, config_title, config_name, config_value, 
          input_type, size, maxlength, input_type_title, class, required, 
          display_order, comments, display_status, additional, 
          display_on_dashboard, display_on_third_party, site_config_parent_id, 
          deleted_status, root_user_only, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      `;
      
      const configValues = [
        [1, 0, 'Application Title', 'FRONT_APPLICATION_TITLE', 'CMS123', 'text', 100, 100, 'Please enter your application name for display on frontend side as title', 'form-control', 'Y', 1, null, 'Y', null, 'Y', 'Y', 1, 'N', 'N', '2019-04-11 13:00:00', '2026-01-30 09:34:40'],
        [2, 0, 'Records per page', 'FRONT_RECORD_PER_PAGE', '16', 'select', 100, 60, 'Records per page', 'form-control', 'Y', 5, '8@=16@=24@=32@=40@=80', 'Y', null, 'Y', 'Y', 1, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [7, 0, 'Maintenance Mode', 'SITE_CONSTRUCTION', 'No', 'select', 100, 60, 'Site Under Construction Status', 'form-control', 'Y', 12, 'Yes@=No', 'Y', null, 'Y', 'N', 1, 'N', 'N', '2019-04-11 13:00:00', '2021-12-07 22:07:04'],
        [8, 0, 'Default Timezone', 'FRONT_DEFAULT_TIMEZONE', 'Asia/Kolkata', 'select', 100, 60, 'Default Timezone', 'form-control', 'Y', 13, 'America/Chicago@=Asia/Kolkata@=Europe/London@=Australia/Perth', 'Y', null, 'Y', 'Y', 1, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [9, 0, 'Backend application Title', 'BACKEND_APPLICATION_TITLE', 'Cloudswift :: Administrator', 'text', 100, 60, 'Application Title', 'form-control', 'Y', 14, null, 'Y', null, 'Y', 'N', 2, 'N', 'N', '2019-04-11 13:00:00', '2019-10-14 07:08:57'],
        [14, 0, 'Meta Description', 'FRONT_META_DESCRIPTION', 'We are the leading Custom Software Solution Company in Vadodara, Gujarat, India who servered more then 50 Clients across World.', 'text', 100, 60, 'Meta Description', 'form-control', 'Y', 1, null, 'Y', null, 'N', 'N', 1, 'N', 'N', '2019-04-11 13:00:00', '2020-04-17 01:06:07'],
        [15, 0, 'Default Robots', 'FRONT_DEFAULT_ROBOTS', 'INDEX,FOLLOW', 'select', 100, 60, 'Default Robots', 'form-control', 'Y', 25, 'INDEX,FOLLOW@=NOINDEX@=NOFOLLOW@=NOINDEX,NOFOLLOW', 'Y', null, 'Y', 'Y', 3, 'N', 'N', '2019-04-11 13:00:00', '2019-10-17 08:06:12'],
        [38, 0, 'Company Name', 'COMPANY_NAME', 'Cloudswift Solutions Pvt. Ltd.', 'text', 100, 60, 'Company Name', 'form-control', 'Y', 64, null, 'Y', null, 'N', 'Y', 7, 'N', 'N', '2019-04-11 13:00:00', '2019-11-07 22:26:19'],
        [39, 0, 'Company Address', 'COMPANY_ADDRESS1', 'Sama, Near Chanikya crossing', 'text', 100, 60, 'Company Address', 'form-control', 'Y', 65, null, 'Y', null, 'N', 'Y', 7, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [40, 0, 'Company Address 2', 'COMPANY_ADDRESS2', '', 'text', 100, 60, 'Company Address 2', 'form-control', 'Y', 66, null, 'Y', null, 'N', 'Y', 7, 'N', 'N', '2019-04-11 13:00:00', '2019-09-24 08:43:53'],
        [41, 0, 'City', 'COMPANY_CITY', 'Vadodara', 'text', 100, 60, 'City', 'form-control', 'Y', 67, null, 'Y', null, 'N', 'Y', 7, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [42, 0, 'State', 'COMPANY_STATE', 'GJ', 'text', 100, 60, 'State', 'form-control', 'Y', 68, null, 'Y', null, 'N', 'Y', 7, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [43, 0, 'Country', 'COMPANY_COUNTRY', 'INN', 'text', 100, 60, 'Country', 'form-control', 'Y', 69, null, 'Y', null, 'N', 'Y', 7, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [44, 0, 'Zipcode', 'COMPANY_ZIPCODE', '390009', 'text', 100, 60, 'Zipcode', 'form-control', 'Y', 70, 'max six digits', 'Y', null, 'N', 'Y', 7, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [45, 0, 'Contact Number', 'COMPANY_CONTACT_NUMBER', '886-630-3621', 'text', 100, 60, 'Contact Number', 'form-control', 'Y', 71, null, 'Y', null, 'N', 'Y', 7, 'N', 'N', '2019-04-11 13:00:00', '2020-04-13 11:50:21'],
        [47, 0, 'Contact us email address', 'COMPANY_EMAIL', 'connect@cloudswiftsolutions.com', 'email', 100, 60, 'Contact us email address', 'form-control', 'Y', 74, null, 'Y', null, 'N', 'Y', 8, 'N', 'N', '2019-04-11 13:00:00', '2021-08-13 00:40:23'],
        [48, 0, 'Contact us person name', 'COMPANY_CONTACT_PERSON', 'CloudSwift Solutions', 'text', 100, 60, 'Contact us person name', 'form-control', 'Y', 75, null, 'Y', null, 'N', 'Y', 8, 'N', 'N', '2019-04-11 13:00:00', '2021-08-13 01:15:54'],
        [53, 0, 'Allow Sending emails', 'ALLOW_SENDING_EMAIL', 'Yes', 'select', 100, 5, 'Allow to send email throughout site? If no, not a single email will execute in this project.', 'form-control', 'Y', 82, 'Yes@=No', 'Y', null, 'N', 'N', 9, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [67, 0, 'Order email name', 'ORDER_CONTACT_PERSON', 'Cloud Swift Solutions', 'text', 100, 60, 'order person name', 'form-control', 'Y', 75, null, 'Y', null, 'N', 'N', 8, 'N', 'N', '2019-04-11 13:00:00', '2019-11-18 20:14:30'],
        [75, 0, 'From email address', 'FROM_EMAIL_ADDRESS', 'notifications@cloudswiftsolutions.com', 'email', 100, 60, 'from email address', 'form-control', 'Y', 74, null, 'Y', null, 'N', 'Y', 8, 'N', 'N', '2019-04-11 13:00:00', '2021-06-21 21:54:54'],
        [76, 0, 'Backend Logo title display', 'BACKEND_LOGO_TITLE_DISPLAY', 'Administrator', 'text', 100, 60, 'backend_logo_title_display', 'form-control', 'Y', 8, '', 'Y', null, 'N', 'Y', 2, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [83, 0, 'Content to display before end of body tag', 'CONTENT_BEFORE_BODY_TAG', '', 'textarea', 100, 6000, 'Please enter content that will before close of body tag.', 'form-control', 'N', 26, null, 'Y', null, 'N', 'Y', 9, 'N', 'N', '2019-04-11 13:00:00', '2019-09-24 09:24:46'],
        [86, 0, 'Script after begin head tag', 'AFTER_HEAD_TAG', '', 'text', 100, 60, 'After head tag javacript script', 'form-control', 'N', 39, null, 'Y', null, 'N', 'Y', 3, 'N', 'N', '2019-04-11 13:00:00', '2019-09-24 08:43:53'],
        [88, 0, 'Application json script', 'APPLICATION_JSON_SCRIPT', '', 'textarea', 100, 6000, 'Application json script', 'form-control', 'N', 26, null, 'Y', null, 'N', 'Y', 3, 'N', 'N', '2019-04-11 13:00:00', '2019-09-24 09:24:46'],
        [97, 0, 'Upload Max Size', 'UPLOAD_MAX_FILESIZE', '2M', 'select', 100, 60, 'Upload Max Size', 'form-control', 'Y', 44, '2M@=8M@=16M@=24M', 'Y', null, 'N', 'N', 4, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [102, 0, 'Facebook', 'FACEBOOK_URL', 'https://www.facebook.com/cloudswiftsolutions/', 'text', 100, 60, 'Please enter your facebook page url', 'form-control', 'N', 40, null, 'Y', null, 'N', 'Y', 10, 'N', 'N', '2019-04-11 13:00:00', '2019-10-14 07:58:52'],
        [103, 0, 'Twitter', 'TWITTER_URL', 'https://twitter.com/cloudswiftsolutions', 'text', 100, 60, 'Please enter your twitter page url', 'form-control', 'N', 40, null, 'Y', null, 'N', 'Y', 10, 'N', 'N', '2019-04-11 13:00:00', '2019-10-14 07:59:00'],
        [104, 0, 'Linkedin', 'LINKEDIN_URL', 'https://www.linkedin.com/company/cloudswiftsolutions/', 'text', 100, 60, 'Please enter your Linkedin page url', 'form-control', 'N', 40, null, 'Y', null, 'N', 'Y', 10, 'N', 'N', '2019-04-11 13:00:00', '2019-10-14 07:59:06'],
        [197, 0, 'Allow to sent email to admin for contact,feedback,etc.', 'ALLOW_CONTACT_EMAIL', 'Y', 'select', 100, 60, 'Please select option', 'form-control', 'Y', 5, 'Y@=N', 'Y', null, 'Y', 'N', 8, 'N', 'N', '2019-04-11 13:00:00', '2019-04-11 21:45:59'],
        [211, 0, 'Application Name', 'FRONT_APPLICATION_NAME', 'Cloudswift Solutions', 'text', 100, 100, 'Please enter your application name for display on frontend side as name', 'form-control', 'Y', 1, null, 'Y', null, 'Y', 'Y', 1, 'N', 'N', '2019-04-11 18:30:00', '2019-10-14 13:22:59'],
        [236, 0, 'Closed Store Status', 'CLOSED_STORE_STATUS', 'N', 'select', 100, 100, 'This store is closed at present.', 'form-control', 'Y', 1, 'Y@=N', 'Y', null, 'Y', 'Y', 1, 'N', 'N', '2019-04-11 18:30:00', '2021-08-02 10:54:46'],
        [237, 0, 'Closed Store Message', 'CLOSED_STORE_MESSAGE', 'Store is Under Construction', 'text', 100, 100, 'Closed Store Message', 'form-control', 'Y', 1, null, 'Y', null, 'Y', 'Y', 1, 'N', 'N', '2019-04-11 18:30:00', '2021-08-02 10:52:45'],
        [241, 0, 'BCC Email 1', 'BCC_EMAIL_1', 'bcc', 'email', 100, 60, 'BCC Email', 'form-control', 'Y', 74, null, 'Y', null, 'N', 'Y', 8, 'N', 'N', '2019-04-11 18:30:00', '2026-01-29 15:39:46'],
        [243, 0, 'SMTP HOST', 'SMTP_HOST', 'smtp.hostinger.com', 'text', 100, 60, 'SMTP HOST', 'form-control', 'Y', 74, null, 'Y', null, 'N', 'Y', 8, 'N', 'N', '2019-04-11 18:30:00', '2021-08-13 06:20:26'],
        [244, 0, 'SMTP PORT', 'SMTP_PORT', '587', 'text', 100, 60, 'SMTP Port', 'form-control', 'Y', 74, null, 'Y', null, 'N', 'Y', 8, 'N', 'N', '2019-04-11 18:30:00', '2023-09-16 22:32:56'],
        [245, 0, 'SMTP PASSWORD', 'SMTP_PASSWORD', 'Cloud@112018', 'email', 100, 60, 'SMTP PASSWORD', 'form-control', 'Y', 74, null, 'Y', null, 'N', 'Y', 8, 'N', 'N', '2019-04-11 18:30:00', '2021-08-13 06:20:26']
      ];
      
      for (const config of configValues) {
        await query(configSql, config);
      }
      console.log("✅ Seeded 'site_config' table with", configValues.length, "records");
    } else {
      console.log("⚠️ 'site_config' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'site_config' table:", err.message);
  }

  // ==================== SEED ROLE_ACCESS TABLE ====================
  try {
    const checkRoleAccessQuery = `SELECT COUNT(*) as count FROM role_access`;
    const checkRoleAccessResult = await query(checkRoleAccessQuery);
    
    if (parseInt(checkRoleAccessResult.rows[0].count) === 0) {
      const roleAccessSql = `
        INSERT INTO role_access (
          role_access_id, site_id, role_id, module_id, grant_add, grant_edit, 
          grant_delete, grant_view, display_order, display_status, deleted_status, 
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;
      
      const roleAccessValues = [
        [311, 0, 1, 6, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [310, 0, 1, 7, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [309, 0, 1, 9, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [328, 0, 2, 6, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [327, 0, 2, 7, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [326, 0, 2, 9, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [308, 0, 1, 16, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [307, 0, 1, 33, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [306, 0, 1, 34, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [305, 0, 1, 38, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [304, 0, 1, 44, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [383, 0, 3, 1, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [382, 0, 3, 2, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [381, 0, 3, 3, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [380, 0, 3, 5, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [379, 0, 3, 6, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [378, 0, 3, 7, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [377, 0, 3, 9, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [376, 0, 3, 16, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [303, 0, 1, 48, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [302, 0, 1, 49, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [301, 0, 1, 50, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [300, 0, 1, 51, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [299, 0, 1, 52, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [325, 0, 2, 16, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [324, 0, 2, 33, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [323, 0, 2, 34, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [322, 0, 2, 38, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [321, 0, 2, 44, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [320, 0, 2, 48, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [319, 0, 2, 49, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [318, 0, 2, 50, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [317, 0, 2, 51, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [316, 0, 2, 52, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [298, 0, 1, 53, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [297, 0, 1, 54, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [296, 0, 1, 55, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [295, 0, 1, 56, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [312, 0, 1, 5, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [313, 0, 1, 3, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [314, 0, 1, 2, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [315, 0, 1, 1, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-01 12:01:34', '2025-10-01 06:31:34'],
        [329, 0, 2, 5, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [330, 0, 2, 3, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [331, 0, 2, 2, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [332, 0, 2, 1, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-02 09:44:20', '2025-10-02 04:14:20'],
        [375, 0, 3, 33, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [374, 0, 3, 34, 'Y', 'Y', 'Y', 'Y', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [373, 0, 3, 38, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [372, 0, 3, 44, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [371, 0, 3, 48, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [370, 0, 3, 49, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [369, 0, 3, 50, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [368, 0, 3, 51, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39'],
        [367, 0, 3, 52, 'N', 'N', 'N', 'N', 0, 'Y', 'N', '2025-10-03 12:14:39', '2025-10-03 06:44:39']
      ];
      
      for (const roleAccess of roleAccessValues) {
        await query(roleAccessSql, roleAccess);
      }
      console.log("✅ Seeded 'role_access' table with", roleAccessValues.length, "records");
    } else {
      console.log("⚠️ 'role_access' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'role_access' table:", err.message);
  }

  // ==================== SEED ROLE TABLE ====================
  try {
    const checkRoleQuery = `SELECT COUNT(*) as count FROM role`;
    const checkRoleResult = await query(checkRoleQuery);
    
    if (parseInt(checkRoleResult.rows[0].count) === 0) {
      const roleSql = `
        INSERT INTO role (
          role_id, site_id, role_title, item_alias, item_type, display_order, 
          display_status, display_on_listing, show_action_checkbox, allow_delete, 
          created_by, deleted_status, deleted_by, deleted_by_name, deleted_time, 
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `;
      
      const roleValues = [
        [1, 0, 'Developer', 'developer', 'role', 1, 'Y', 'Y', 'Y', 'N', 0, 'N', 0, null, null, '2025-08-11 04:42:44', '2025-08-11 04:42:53'],
        [2, 0, 'Super Admin', 'superadmin', 'role', 1, 'Y', 'Y', 'Y', 'N', 0, 'N', 0, null, null, '2025-08-12 12:52:34', '2025-08-12 12:52:50'],
        [3, 0, 'Admin', 'admin', 'role', 1, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-09-01 04:43:03', '2025-09-01 04:43:17'],
        [4, 0, 'Franchise', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:40:32', '2025-10-24 05:10:44'],
        [5, 0, 'Reporter', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:42:38', '2025-10-24 05:12:50'],
        [6, 0, 'Editor', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:44:01', '2025-10-24 05:14:15'],
        [7, 0, 'Fr', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:45:46', '2025-10-24 05:16:03'],
        [8, 0, 'Fr', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:45:46', '2025-10-24 05:16:38'],
        [9, 0, 'Fr', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:45:46', '2025-10-24 05:17:19'],
        [10, 0, 'Fr', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:45:46', '2025-10-24 05:17:40'],
        [11, 0, 'Fr', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:45:46', '2025-10-24 05:17:58'],
        [12, 0, 'Fr', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:45:46', '2025-10-24 05:22:45'],
        [13, 0, 'Fr', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:45:46', '2025-10-24 05:23:11'],
        [14, 0, 'Fr', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:45:46', '2025-10-24 05:28:21'],
        [15, 0, 'Fr', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:45:46', '2025-10-24 05:28:30'],
        [16, 0, 'Fr', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:45:46', '2025-10-24 05:29:31'],
        [17, 0, 'Fr', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:45:46', '2025-10-24 05:30:11'],
        [18, 0, 'Fr', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 05:15:46', '2025-10-24 05:30:26'],
        [19, 0, 'Fr', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2025-10-24 10:45:46', '2025-10-24 05:31:17'],
        [20, 0, 'mikeeeeeeee', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2026-01-29 18:21:14', '2026-01-29 12:51:32'],
        [21, 0, '11223', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2026-01-29 18:24:05', '2026-01-29 12:54:12'],
        [22, 0, '11223', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2026-01-29 18:24:05', '2026-01-29 12:54:50'],
        [23, 0, '11223', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2026-01-29 12:54:05', '2026-01-29 12:55:39'],
        [24, 0, '11223', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2026-01-29 18:24:05', '2026-01-29 12:57:30'],
        [25, 0, 'note update @$#%^%&((()\'\'\\', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2026-01-29 18:29:49', '2026-01-29 12:59:56'],
        [26, 0, 'newwwwww', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2026-01-29 21:26:44', '2026-01-29 15:56:51'],
        [27, 0, '3231321 31 23 123', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2026-01-30 14:59:15', '2026-01-30 09:32:01'],
        [28, 0, 'Rv', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2026-01-30 15:07:08', '2026-01-30 09:37:16'],
        [29, 0, '2222222', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2026-01-30 15:13:24', '2026-01-30 09:43:57'],
        [30, 0, '`\'"\\\\\\`~!@#$%^&*()_-+=[]{}|:;\"\'<', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2026-01-30 17:06:33', '2026-01-30 11:36:38'],
        [31, 0, '112233', '', 'role', 0, 'Y', 'Y', 'Y', 'Y', 0, 'N', 0, null, null, '2026-01-30 17:15:51', '2026-01-30 11:45:59']
      ];
      
      for (const role of roleValues) {
        await query(roleSql, role);
      }
      console.log("✅ Seeded 'role' table with", roleValues.length, "records");
    } else {
      console.log("⚠️ 'role' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'role' table:", err.message);
  }

  // ==================== SEED META_DETAILS TABLE ====================
  try {
    const checkMetaDetailsQuery = `SELECT COUNT(*) as count FROM meta_details`;
    const checkMetaDetailsResult = await query(checkMetaDetailsQuery);
    
    if (parseInt(checkMetaDetailsResult.rows[0].count) === 0) {
      const metaDetailsSql = `
        INSERT INTO meta_details (
          meta_id, site_id, parent_id, end_points, page_title, meta_title, 
          meta_description, sidebar_title, sidebar_icon, sidebar_order, params, 
          is_module, deleted_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;
      
      const metaDetailsValues = [
        [1, 0, 0, '/', 'Dashboard', 'Dashboard', 'Dashboard', 'Dashboard', 'mdi-view-dashboard', 1, null, 1, 'N'],
        [2, 0, 0, '/users', 'Users', 'Users', 'Users', 'Users', 'mdi-account-box', 104, null, 1, 'N'],
        [3, 0, 0, '/change-password', 'change password', 'Change Password', 'Change Password', 'Change Password', 'mdi mdi-server-security', 105, null, 1, 'N'],
        [5, 0, 0, '/items?item_type=page', 'Pages', 'Pages', 'Pages', 'Pages', 'mdi-format-list-bulleted', 3, null, 1, 'N'],
        [6, 0, 0, '/configurations', 'Configurations', 'Configurations Meta', 'Desc', 'Configurations', 'mdi-view-headline', 109, null, 1, 'N'],
        [12, 0, 0, '/user_form', 'user form', 'user form', 'user form', 'user form', null, 0, null, 0, 'N'],
        [10, 0, 0, '/item_section_form', 'section form', 'section form', 'section form', 'section form', null, 0, null, 0, 'N'],
        [7, 0, 0, '/logout', 'Logout', 'Logout', 'Logout', 'Logout', 'mdi-logout-variant', 201, null, 1, 'N'],
        [8, 0, 0, '/login', 'Login', 'Login', 'Login', 'Login', null, 0, null, 0, 'N'],
        [9, 0, 0, '/metadetails', 'Meta Details', 'Meta Details', 'Meta Details', 'SEO', 'mdi-format-list-bulleted', 108, null, 1, 'N'],
        [11, 0, 0, '/item_form', 'item form', 'item form', 'item form', 'item form', null, 0, null, 0, 'N'],
        [13, 0, 0, '/forgot-password', 'Forgot Password', 'Forgot Password', 'Forgot Password', 'Forgot Password', null, 0, null, 0, 'N'],
        [14, 0, 0, '/password-token', 'Password Token', 'Password Token', 'Password Token', 'Password Token', null, 0, null, 0, 'N'],
        [15, 0, 0, '/reset-password', 'Reset Password', 'Reset Password', 'Reset Password', 'Reset Password', null, 0, null, 0, 'N'],
        [16, 0, 0, '/roles', 'Roles', 'Roles', 'Roles', 'Roles', 'mdi mdi-account', 103, null, 1, 'N'],
        [17, 0, 0, '/role_form', 'Role Form', 'Role Form', 'Role Form', 'Role Form', null, 0, null, 0, 'N'],
        [42, 0, 0, '/item_form?item_type=blog', 'Blog Form', 'Blog Form', 'Blog Form', null, null, 0, null, 0, 'N'],
        [41, 0, 0, '/item_form?item_type=page', 'Page Form', 'Page Form', 'Page Form', null, null, 0, null, 0, 'N'],
        [45, 0, 0, '/item_section_form?item_type=default', 'Default Section Form', 'Default Section Form', 'Default Section Form', null, null, 0, null, 0, 'N'],
        [46, 0, 0, '/item_section_form?item_type=blog-category', 'Blog Category Form', 'Blog Category Form', 'Blog Category Form', null, null, 0, null, 0, 'N'],
        [47, 0, 0, '/items/default', 'Demonstration Company', 'Demonstration Company', 'Demonstration Company Description', null, null, 0, null, 0, 'N'],
        [48, 0, 0, '/database_table', 'Database Tables', 'Database Tables', 'Database Tables', 'Database Tables', 'mdi mdi-view-headline', 200, null, 1, 'N'],
        [33, 0, 0, '/item_section?item_type=blog-category', 'Blog Category', 'Blog Category', 'Blog Category', 'Blog Category', 'mdi mdi-view-headline', 5, null, 1, 'N'],
        [34, 0, 0, '/items?item_type=blog', 'Blogs', 'Blogs', 'Blogs', 'Blogs', 'mdi-format-list-bulleted', 5, null, 1, 'N'],
        [39, 0, 0, '/item_form?item_type=default', 'Default Form', 'Default Form', 'Default Form', null, null, 0, null, 0, 'N'],
        [38, 0, 0, '/items?item_type=default', 'Default Item', 'Default', 'Default', 'Default Items', 'mdi-format-list-bulleted', 1, null, 1, 'N'],
        [44, 0, 0, '/item_section?item_type=default', 'Default Section', 'Default Section', 'Default', 'Default Section', 'mdi mdi-view-headline', 1, null, 1, 'N'],
        [49, 0, 52, '/template/mdiicons', 'Demonstration Company', 'Demonstration Company', 'Demonstration Company Description', 'MDI Icons', 'mdi mdi-view-headline', 404, 'ui-basic', 1, 'Y'],
        [50, 0, 52, '/template/formelement', 'Form Elements', 'Form Elements', 'Form Elements', 'Form Element', 'mdi mdi-view-headline', 403, 'ui-basic', 1, 'Y'],
        [51, 0, 52, '/template/gallery', 'Gallery', 'Gallery', 'Gallery', 'Gallery', 'mdi mdi-view-headline', 402, 'ui-basic', 1, 'Y'],
        [52, 0, -1, '/template', 'Templates', 'Templates', 'Templates', 'Templates', 'ui-basic', 401, null, 1, 'Y'],
        [60, 0, 0, '/items', 'Demonstration Company', 'Demonstration Company', 'Demonstration Company Description', null, null, 0, null, 0, 'N']
      ];
      
      for (const metaDetail of metaDetailsValues) {
        await query(metaDetailsSql, metaDetail);
      }
      console.log("✅ Seeded 'meta_details' table with", metaDetailsValues.length, "records");
    } else {
      console.log("⚠️ 'meta_details' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'meta_details' table:", err.message);
  }

  // ==================== SEED ITEM_SECTION_RELATION TABLE ====================
  try {
    const checkItemSectionRelationQuery = `SELECT COUNT(*) as count FROM item_section_relation`;
    const checkItemSectionRelationResult = await query(checkItemSectionRelationQuery);
    
    if (parseInt(checkItemSectionRelationResult.rows[0].count) === 0) {
      const itemSectionRelationSql = `
        INSERT INTO item_section_relation (
          item_section_relation_id, site_id, item_id, section_id, deleted_status, 
          deleted_by, deleted_time
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      
      const itemSectionRelationValues = [
        [8, 0, 31, 24, 'N', 0, null],
        [9, 0, 31, 25, 'N', 0, null],
        [10, 0, 31, 26, 'N', 0, null],
        [11, 0, 34, 25, 'N', 0, null],
        [12, 0, 35, 24, 'N', 0, null],
        [14, 0, 36, 25, 'N', 0, null],
        [16, 0, 37, 25, 'N', 0, null],
        [21, 0, 38, 25, 'N', 0, null],
        [22, 0, 39, 25, 'N', 0, null],
        [24, 0, 40, 24, 'N', 0, null],
        [25, 0, 40, 25, 'N', 0, null],
        [26, 0, 40, 26, 'N', 0, null],
        [30, 0, 41, 25, 'N', 0, null],
        [31, 0, 41, 29, 'N', 0, null],
        [32, 0, 41, 31, 'N', 0, null],
        [33, 0, 42, 29, 'N', 0, null],
        [34, 0, 42, 31, 'N', 0, null],
        [35, 0, 42, 32, 'N', 0, null],
        [36, 0, 43, 24, 'N', 0, null],
        [37, 0, 44, 25, 'N', 0, null],
        [38, 0, 44, 29, 'N', 0, null],
        [39, 0, 45, 24, 'N', 0, null],
        [40, 0, 45, 25, 'N', 0, null],
        [41, 0, 45, 26, 'N', 0, null]
      ];
      
      for (const relation of itemSectionRelationValues) {
        await query(itemSectionRelationSql, relation);
      }
      console.log("✅ Seeded 'item_section_relation' table with", itemSectionRelationValues.length, "records");
    } else {
      console.log("⚠️ 'item_section_relation' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'item_section_relation' table:", err.message);
  }

  // ==================== SEED ITEM_SECTION TABLE ====================
  try {
    const checkItemSectionQuery = `SELECT COUNT(*) as count FROM item_section`;
    const checkItemSectionResult = await query(checkItemSectionQuery);
    
    if (parseInt(checkItemSectionResult.rows[0].count) === 0) {
      const itemSectionSql = `
        INSERT INTO item_section (
          item_section_id, site_id, item_section_parent_id, section_title, section_alias, 
          item_type, description, attachment1, user_id, display_order, display_status, 
          meta_title, meta_description, created_by, created_by_name, created_by_role, 
          deleted_status, deleted_by, deleted_by_name, deleted_time, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      `;
      
      const itemSectionValues = [
        [34, 0, 0, '1234456 update', '1234456-1769749437', 'default', '1234456 update', null, 1, 4, 'Y', '1234456 update', '1234456 update', 1, 'Developer Account', 1, 'N', 0, null, null, '2026-01-30 10:33:43', '2026-01-30 05:03:57'],
        [33, 0, 0, '1111111111112222222', '111111111111-1769702432', 'default', '1111111111', 'attachment1-1769702432060.png', 1, 3, 'Y', '111111111', '2222222222', 1, 'Developer Account', 1, 'N', 0, null, null, '2026-01-29 21:30:17', '2026-01-29 16:00:32'],
        [32, 0, 0, '3344551122', '334455-1769694419', 'blog-category', '221133', '', 1, 26, 'Y', '112233', '11222', 1, 'Developer Account', 1, 'N', 0, null, null, '2026-01-29 19:16:48', '2026-01-29 13:46:59'],
        [31, 0, 0, '112233', '112233', 'blog-category', 'eeee', '', 1, 25, 'Y', '123', '233', 1, 'Developer Account', 1, 'N', 0, null, null, '2026-01-29 18:37:46', '2026-01-29 13:07:56'],
        [30, 0, 0, 'Section 2', 'section-2', 'default', 'item description2', null, 1, 2, 'Y', 'meta title', '', 1, 'Developer Account', 1, 'N', 0, null, null, '2025-10-24 10:38:52', '2025-10-24 05:09:10'],
        [29, 0, 0, 'Admin Category 1', 'admin-category-1', 'blog-category', 'Admin Category 1', '', 3, 24, 'Y', 'Admin Category 1', 'Admin Category 1', 3, 'Admin Admin', 3, 'N', 0, null, null, '2025-10-03 12:11:45', '2025-10-03 06:41:52'],
        [28, 0, 0, 'Default 2 update', 'default-2', 'default', 'Default 2 update', 'attachment1-1758621718238.sql', 1, 1, 'Y', 'Default 2 update', 'Default 2 update', 1, 'Cloudswift Solutions', 1, 'N', 0, null, null, '2025-09-23 15:31:42', '2025-09-23 10:01:58'],
        [27, 0, 0, 'Default Title', 'default-title', 'blog', 'Default Description', 'attachment1-1758621657001.sql', 1, 1, 'Y', 'Default Title', 'Default Title', 1, 'Cloudswift Solutions', 1, 'N', 0, null, null, '2025-09-23 15:30:34', '2025-09-23 10:00:57'],
        [24, 0, 0, 'Blog Category 1', 'custom-section', 'blog-category', 'Blog Category 1', null, 1, 23, 'Y', 'Blog Category 1', 'Blog Category 1', 1, 'Cloudswift Solutions', 1, 'N', 0, null, null, '2025-09-23 08:42:42', '2025-09-23 03:12:51'],
        [25, 0, 0, 'Blog Category 2', 'blog-category-2', 'blog-category', 'Blog Category 2', null, 1, 23, 'Y', 'Blog Category 2', 'Blog Category 2', 1, 'Cloudswift Solutions', 1, 'N', 0, null, null, '2025-09-23 08:45:59', '2025-09-23 03:16:09'],
        [26, 0, 0, 'Blog Category 3', 'blog-category-3', 'blog-category', 'Blog Category 3', null, 1, 23, 'Y', 'Blog Category 3', 'Blog Category 3', 1, 'Cloudswift Solutions', 1, 'N', 0, null, null, '2025-09-23 08:46:23', '2025-09-23 03:16:31'],
        [35, 0, 0, 'mfdffasfs', 'mfdffasfs-1769762441', 'blog-category', 'dsfsf', '', 1, 27, 'Y', 'dfsfsadfsd', 'fdsfs', 1, 'Developer Account', 1, 'N', 0, null, null, '2026-01-30 14:10:33', '2026-01-30 08:40:41'],
        [36, 0, 0, '3231321 31 23 123', '3231321-31-23-123-1769765314', 'default', '3231321 31 23 123', 'attachment1-1769765324886.png', 1, 5, 'Y', '3231321 31 23 123', '3231321 31 23 123', 1, 'Developer Account', 1, 'N', 0, null, null, '2026-01-30 14:58:21', '2026-01-30 09:28:34'],
        [37, 0, 0, ' fd fd  43 423 3 32 334 324', 'fd-fd-43-423-3-32-334-324-1769765780', 'default', ' fd fd  43 423 3 32 334 324', 'attachment1-1769765780115.png', 1, 6, 'Y', ' fd fd  43 423 3 32 334 324', ' fd fd  43 423 3 32 334 324', 1, 'Developer Account', 1, 'Y', 1, 'Developer Account', '2026-01-30 15:06:32', '2026-01-30 15:06:07', '2026-01-30 09:36:20'],
        [38, 0, 0, '2222222', '2222222-1769766193', 'default', '2222222', 'attachment1-1769766193676.png', 1, 7, 'Y', '2222222', '2222222', 1, 'Developer Account', 1, 'N', 0, null, null, '2026-01-30 15:13:03', '2026-01-30 09:43:13'],
        [39, 0, 0, '`\'"\\\\\\`~!@#$%^&*()_-+=[]{}|:;\"\'<', '', 'default', '`\'"\\\\\\`~!@#$%^&*()_-+=[]{}|:;\"\'<', null, 1, 8, 'Y', '`\'"\\\\\\`~!@#$%^&*()_-+=[]{}|:;\"\'<', '`\'"\\\\\\`~!@#$%^&*()_-+=[]{}|:;\"\'<', 1, 'Developer Account', 1, 'N', 0, null, null, '2026-01-30 17:05:58', '2026-01-30 11:36:08'],
        [40, 0, 0, '112233', '112233-1769773670', 'default', '112233', null, 1, 9, 'Y', '112233', '112233', 1, 'Developer Account', 1, 'N', 0, null, null, '2026-01-30 17:17:42', '2026-01-30 11:47:50']
      ];
      
      for (const itemSection of itemSectionValues) {
        await query(itemSectionSql, itemSection);
      }
      console.log("✅ Seeded 'item_section' table with", itemSectionValues.length, "records");
    } else {
      console.log("⚠️ 'item_section' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'item_section' table:", err.message);
  }

  // ==================== SEED ITEMS TABLE ====================
  try {
    const checkItemsQuery = `SELECT COUNT(*) as count FROM items`;
    const checkItemsResult = await query(checkItemsQuery);
    
    if (parseInt(checkItemsResult.rows[0].count) === 0) {
      const itemsSql = `
        INSERT INTO items (
          item_id, site_id, item_title, item_alias, item_parent, item_type, 
          item_sections_id, item_description, attachment1, attachment2, 
          item_shortdescription, user_id, controller, action, published_at, 
          published_end_at, meta_title, meta_description, created_by, 
          created_by_name, created_by_role, display_order, display_status, 
          deleted_status, deleted_by, deleted_by_name, deleted_time, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
      `;
      
      const itemsValues = [
        [24, 0, 'Mayank ', 'mayank', 100, 'default', '24', 'description update', 'attachment1-1758612676875.png', 'attachment2-1758612676877.png', 'short description update', 3, 'controller', 'action', '2025-09-03', '2025-09-21', 'meta title update', 'meta description update', 1, 'Cloudswift Solutions', 1, 1, 'Y', 'N', 0, null, null, '2025-09-23 06:18:45', '2025-09-23 06:20:51'],
        [25, 0, 'About Us', 'about-us', 0, 'page', '', 'About Us', null, '', '', 1, '', '', '2025-09-23', '2030-09-23', 'About Us', 'About Us', 1, 'Cloudswift Solutions', 1, 1, 'Y', 'N', 0, null, null, '2025-09-23 07:45:18', '2025-09-23 07:45:27'],
        [26, 0, 'Terms & Conditions', 'terms-and-conditions', 0, 'page', '', 'Terms & Conditions', null, '', '', 1, '', '', '2025-09-23', '2030-09-23', 'Terms & Conditions', 'Terms & Conditions', 1, 'Cloudswift Solutions', 1, 2, 'Y', 'N', 0, null, null, '2025-09-23 07:46:35', '2025-09-23 07:46:43'],
        [27, 0, 'Privacy Policy', 'privacy-policy', 0, 'page', '', 'Privacy Policy', null, '', '', 1, '', '', '2025-09-23', '2030-09-23', 'Privacy Policy', 'Privacy Policy', 1, 'Cloudswift Solutions', 1, 3, 'Y', 'N', 0, null, null, '2025-09-23 08:09:19', '2025-09-23 08:09:27'],
        [28, 0, 'Blog2', 'blog2', 0, 'blog', '24', 'Blog2', null, '', '', 1, '', '', '2025-09-23', '2030-09-23', 'Blog2', 'Blog2', 1, 'Cloudswift Solutions', 1, 2, 'Y', 'N', 0, null, null, '2025-09-23 08:22:54', '2025-09-23 08:23:25'],
        [29, 0, 'Default2', 'default2', 0, 'default', '24', 'Default2', null, null, 'Default2', 1, 'Default2', 'Default2', '2025-09-23', '2030-09-23', 'Default2', 'Default2', 1, 'Cloudswift Solutions', 1, 2, 'Y', 'N', 0, null, null, '2025-09-23 08:23:44', '2025-09-23 08:24:03'],
        [30, 0, 'Default3', 'default3', 0, 'default', '24', 'Default3', null, null, 'Default3', 1, 'Default3', 'Default3', '2025-10-03', '2030-10-03', 'Default3', 'Default3', 1, 'Developer Account', 1, 3, 'Y', 'N', 0, null, null, '2025-10-03 05:55:14', '2025-10-03 06:04:53'],
        [31, 0, 'Default4', 'default4', 0, 'default', '24,25,26', 'Default4', null, null, '', 1, '', '', '2025-10-03', '2030-10-03', '', '', 1, 'Developer Account', 1, 4, 'Y', 'N', 0, null, null, '2025-10-03 06:05:29', '2025-10-03 06:05:40'],
        [32, 0, 'Admin Blog1', 'admin-blog1', 0, 'blog', '24', 'Admin Blog1', null, '', '', 3, '', '', '2025-10-03', '2030-10-03', 'Admin Blog1', 'Admin Blog1', 3, 'Admin Admin', 3, 3, 'Y', 'N', 0, null, null, '2025-10-03 06:38:11', '2025-10-03 06:38:22'],
        [33, 0, 'Admin Blog 2', 'admin-blog-2', 0, 'blog', '24', 'Admin Blog 2', 'attachment1-1759473524880.png', '', '', 3, '', '', '2025-10-03', '2030-10-03', '', '', 3, 'Admin Admin', 3, 4, 'Y', 'N', 0, null, null, '2025-10-03 06:38:31', '2025-10-03 06:38:44'],
        [34, 0, 'blog 1', 'blog-1-8967', 0, 'blog', '25', 'description', null, '', '', 1, '', '', '2025-10-24', '2030-10-24', 'meta title', 'meta desc', 1, 'Developer Account', 1, 5, 'Y', 'N', 0, null, null, '2025-10-24 04:44:50', '2025-10-24 04:45:08'],
        [35, 0, '12222222222', '12222222222-1769694565', 0, 'blog', '24', '12222222222', 'attachment1-1769694565480.png', '', '', 1, '', '', '2026-01-29', '2031-01-29', '12222222222', '12222222222', 1, 'Developer Account', 1, 6, 'Y', 'N', 0, null, null, '2026-01-29 13:49:11', '2026-01-29 13:49:25'],
        [36, 0, 'mayank', 'mayank-1769702274', 0, 'default', '25', 'fdsfafs', 'attachment1-1769702274939.png', 'attachment2-1769702274954.png', 'sdfsadf', 1, '', '', '2026-01-29', '2031-01-29', 'fsdf', 'fsda1111', 1, 'Developer Account', 1, 5, 'Y', 'N', 0, null, null, '2026-01-29 15:57:27', '2026-01-29 15:57:54'],
        [37, 0, 'Mayankpatel Update', 'mayankpatel-1769746822', 0, 'default', '25', '112233', null, null, '221133', 1, '', '', '2026-01-30', '2031-01-30', '', '', 1, 'Developer Account', 1, 6, 'Y', 'N', 0, null, null, '2026-01-30 04:20:11', '2026-01-30 04:20:22'],
        [38, 0, '30012026', '30012026-1769747084', 0, 'default', '25', '30012026', 'attachment1-1769747084387.png', null, '30012026', 1, '', '', '2026-01-30', '2031-01-30', '30012026', '30012026', 1, 'Developer Account', 1, 7, 'Y', 'N', 0, null, null, '2026-01-30 04:24:20', '2026-01-30 04:24:44'],
        [23, 0, 'Blog 1', 'blog-1', 0, 'blog', null, 'Blog 1', null, null, 'Blog 1', 1, null, 'index', '2025-09-23', '2030-09-23', 'Blog 1', 'Blog 1', 1, 'Cloudswift Solutions', 1, 1, 'Y', 'N', 0, null, null, '2025-09-23 03:23:45', '2025-09-23 03:23:56'],
        [39, 0, 'fdfasfs', 'fdfasfs-1769762467', 0, 'default', '25', 'sdfdsafs', null, null, 'fsdafsd', 1, '', '', '2026-01-30', '2031-01-30', 'fdsf', 'dsfsa', 1, 'Developer Account', 1, 8, 'Y', 'N', 0, null, null, '2026-01-30 08:40:55', '2026-01-30 08:41:07'],
        [40, 0, '112233 update', '112233-1769765248', 0, 'default', '24,25,26', '112233 update', 'attachment1-1769765248817.png', 'attachment2-1769765248834.png', '112233', 1, '112233', '112233', '2026-01-30', '2031-01-30', '112233', '112233', 1, 'Developer Account', 1, 9, 'Y', 'N', 0, null, null, '2026-01-30 09:27:02', '2026-01-30 09:27:28'],
        [41, 0, ' fd fd  43 423 3 32 334 324', 'fd-fd-43-423-3-32-334-324-1769765720', 0, 'default', '25,29,31', ' fd fd  43 423 3 32 334 324', 'attachment1-1769765720869.png', 'attachment2-1769765720890.png', ' fd fd  43 423 3 32 334 324', 1, ' fd fd  43 423 3 32 334 324', ' fd fd  43 423 3 32 334 324', '2026-01-30', '2031-01-30', ' fd fd  43 423 3 32 334 324', ' fd fd  43 423 3 32 334 324', 1, 'Developer Account', 1, 10, 'Y', 'Y', 1, 'Developer Account', '2026-01-30 15:05:57', '2026-01-30 09:34:59', '2026-01-30 09:35:20'],
        [42, 0, '10', '10-1769766176', 0, 'default', '29,31,32', '10', 'attachment1-1769766176134.png', null, '10', 1, '11', '23', '2026-01-30', '2031-01-30', '12', '12', 1, 'Developer Account', 1, 11, 'Y', 'N', 0, null, null, '2026-01-30 09:42:29', '2026-01-30 09:42:56'],
        [43, 0, 'const query = util.promisify(db.query).bind(db);', 'const-query-utilpromisifydbquerybinddb-1769766586', 0, 'default', '24', 'const query = util.promisify(db.query).bind(db);', null, null, 'const query = util.promisify(db.query).bind(db);', 1, '', '', '2026-01-30', '2031-01-30', '', '', 1, 'Developer Account', 1, 12, 'Y', 'N', 0, null, null, '2026-01-30 09:49:31', '2026-01-30 09:49:46'],
        [44, 0, '`\'"\\\\\\`~!@#$%^&*()_-+=[]{}|:;\"\'<', '', 0, 'default', '25,29', '`\'"\\\\\\`~!@#$%^&*()_-+=[]{}|:;\"\'<', null, null, '', 1, '', '', '2026-01-30', '2031-01-30', '', '', 1, 'Developer Account', 1, 13, 'Y', 'N', 0, null, null, '2026-01-30 11:33:27', '2026-01-30 11:35:37'],
        [45, 0, '112233', '112233-1769773779', 0, 'default', '24,25,26', '112233', null, null, '112233', 1, '', '', '2026-01-30', '2031-01-30', '', '', 1, 'Developer Account', 1, 14, 'Y', 'N', 0, null, null, '2026-01-30 11:49:26', '2026-01-30 11:49:39']
      ];
      
      for (const item of itemsValues) {
        await query(itemsSql, item);
      }
      console.log("✅ Seeded 'items' table with", itemsValues.length, "records");
    } else {
      console.log("⚠️ 'items' table already has data, skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed 'items' table:", err.message);
  }

  console.log("\n🌱 Database seeding completed!");
  await db.end();
  process.exit();
}

seed();
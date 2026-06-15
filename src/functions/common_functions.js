const db = require('../../connection');
const util = require("util");
const path = require("path");
var fs = require("fs");
const query = util.promisify(db.query).bind(db);
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const { CONSTANTS } = require("../constants");
const logInsertQueryToFile = require('../logs/log_insert_query');
const logSelectQueryToFile = require('../logs/log_query');
let transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",//process.env.HOST
  port: process.env.PORT,
  secure: process.env.SECURE,
  auth: {
    user: process.env.AUTH_USER,
    pass: process.env.AUTH_PASS,
  },
});

module.exports = {
    getHostUrl(req) {
      if (process.env.IS_LIVE == 1) {
        return req.protocol + "s://" + req.get("host");
      } else {
        return req.protocol + "://" + req.get("host");
      }
    },
    renderData(req, res, responseData, route_name,decoded) {
        let routename = route_name.replace(/\//g, "");
        if (route_name.length > 30) {
            routename = route_name;
        }
        if(decoded && decoded.web_or_app == 'Web'){
            res.render(routename, responseData);
        } else {
            return res.send(responseData);
        } 
    },
    printQuery : (sql, params = []) => {
      // Detect if SQL uses $n placeholders (e.g., $1, $2)
      if (/\$\d+/.test(sql)) {
        return sql.replace(/\$(\d+)/g, (match, num) => {
          const idx = parseInt(num, 10) - 1;
          const val = params[idx];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return val;
          if (val instanceof Date) {
            return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
          }
          return `'${val.toString().replace(/'/g, "''")}'`;
        });
      }

      // Fallback to ? placeholders
      let index = 0;
      return sql.replace(/\?/g, () => {
        if (index >= params.length) return '?';
        const val = params[index++];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'number') return val;
        if (val instanceof Date) {
          return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
        }
        return `'${val.toString().replace(/'/g, "''")}'`;
      });
    },
    displayStatus() {
        return [
          {ID: "Y",NAME: "Active"},
          {ID: "N",NAME: "Inactive"},
        ];
    },
    itemTypes() {
      return [
        {ID: "blog",NAME: "Blog"},
        {ID: "default",NAME: "Default"},
        {ID: "page",NAME: "Page"},
      ];
    },
    itemSectionTypes() {
      return [
        {ID: "default",NAME: "Default"},
        {ID: "blog",NAME: "Blog"},
      ];
    },
    get_item_alias: async (table_name, column_name, title) => {
      try {
        const a = "àáäâãèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'";
        const b = "aaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------";
        const p = new RegExp(a.split("").join("|"), "g");
        let title_alias = title
          .toString()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(p, (c) => b.charAt(a.indexOf(c)))
          .replace(/&/g, "-and-")
          .replace(/[^\w\-]+/g, "")
          .replace(/\-\-+/g, "-")
          .replace(/^-+/, "")
          .replace(/-+$/, "");
        if (
          !/^[a-zA-Z0-9_]+$/.test(table_name) ||
          !/^[a-zA-Z0-9_]+$/.test(column_name)
        ) {
          throw new Error("Invalid table or column name");
        }
        const sqlCheckAlias = `SELECT ${column_name} FROM ${table_name} WHERE ${column_name} = '${title_alias}' LIMIT 1`;
        const results1 = await query(sqlCheckAlias);
        const results = results1.rows;
        if (results.length > 0) {
          const last5 = Date.now().toString().slice(-5);
          return `${title_alias}-${Number(last5)}`;
        }
        return title_alias;
      } catch (error) {
        console.error("Error in get_item_alias:", error);
        throw error;
      }
    },
    sanitize(str) {
      return (str || "").replace(/'/g, "''"); // Double up single quotes
    },
    getSidebarMenu: async function (req, userRoleId) {
    try {
      const sidebarModule = `
        SELECT meta_id AS module_id, end_points, sidebar_title,
               sidebar_icon, parent_id, params
        FROM meta_details
        WHERE is_module = 1
            AND deleted_status = 'N'
        ORDER BY sidebar_order ASC`;
      const resultsSidebar = await query(sidebarModule);
      const sidebarRows = resultsSidebar.rows;
      
      const sqlAccessModules = `
        SELECT module_id
        FROM role_access
        WHERE role_id = $1
            AND grant_view = 'Y' ORDER BY module_id ASC`;
      
      const resultRoles = await query(sqlAccessModules, [userRoleId]);
      const resultRolesRows = resultRoles.rows;
      const sidebarMenu = sidebarRows.filter((sidebarItem) =>
        resultRolesRows.some((role) => role.module_id === sidebarItem.module_id)
      );
      
      return sidebarMenu;
    } catch (error) {
      console.error("Error fetching sidebar:", error);
      return [];
    }
  },
  async getMetaDetails(req,end_points) {
    try {
      
      end_points = end_points.replace("&api=1", "");
      let sqlPreQuery = `SELECT * FROM meta_details WHERE end_points = $1 AND deleted_status = 'N'`;
      const sqlQuery = this.removeEditIdFromQuery(sqlPreQuery);
      let result = await query(sqlQuery, [end_points]);
      
      const resultRows = result.rows;
      if (resultRows.length === 0) {
        if (
          !end_points.includes("edit_id") &&
          !end_points.includes("paged") &&
          !end_points.includes("api") &&
          !end_points.includes("&") &&
          !end_points.includes("error")
        ) {
          const sqlInsert = `
            INSERT INTO meta_details
            (end_points, page_title, meta_title, meta_description)
            VALUES ($1, $2, $3, $4)
            `;
          await query(sqlInsert, [
            end_points,
            CONSTANTS.APPLICATION_TITLE,
            CONSTANTS.APPLICATION_META_TITLE,
            CONSTANTS.APPLICATION_META_DESCRIPTION,
          ]);
          result = await query(sqlQuery, [end_points]);
        }
      }
      if (resultRows.length > 0) {
        return [
          {
            meta_id: resultRows[0].meta_id,
            page_title: resultRows[0].page_title,
            meta_title: `${resultRows[0].meta_title} - ${CONSTANTS.APPLICATION_META_TITLE}`,
            meta_description: resultRows[0].meta_description,
          },
        ];
      }
      return [
        {
          page_title: CONSTANTS.APPLICATION_TITLE,
          meta_title: CONSTANTS.APPLICATION_META_TITLE,
          meta_description: CONSTANTS.APPLICATION_META_DESCRIPTION,
        },
      ];
    } catch (err) {
      console.error("getMetaDetails Error:", err);
      throw err;
    }
  },
  async getRoleAccess(req, userRoleId, meta_id) {
    try {
        const sql = `
        SELECT 
            role_access_id,
            grant_add,
            grant_edit,
            grant_delete,
            grant_view,
            module_id
        FROM role_access
        WHERE role_id = $1
            AND module_id = $2
        LIMIT 1
        `;
        const result = await query(sql, [userRoleId, meta_id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error in getRoleAccess:", error);
        throw error;
    }
},

async addUserDataToRequest(headers, data) {
  try {
    if (!headers || !headers.startsWith("Bearer ")) {
      return data;
    }
    const token = headers.split(" ")[1];
    const decoded = jwt.decode(token);
    
    if (decoded) {
      return {
        ...data,
        login_id: decoded.user_id,
        login_name : decoded.login_name,
        user_name : decoded.user_name,
        user_email : decoded.user_email,
        is_web: decoded.web_or_app,
        role_id: decoded.user_role_id,
        created_by: decoded.user_id,
        created_by_name: `${decoded.login_name || ""}`.trim(),
        created_by_role: decoded.user_role_id,
      };
    }

    return data;
  } catch (err) {
    console.error("Token decode error:", err);
    return data;
  }
},
async addDatabaseCreatedColumns(headers, data) {
  try {
    if (!headers || !headers.startsWith("Bearer ")) {
      return data;
    }
    const token = headers.split(" ")[1];
    const decoded = jwt.decode(token);
    
    if (decoded) {
      return {
        ...data,
        created_by: decoded.user_id,
        created_by_name: `${decoded.login_name || ""}`.trim(),
        created_by_role: decoded.user_role_id,
      };
    }

    return data;
  } catch (err) {
    console.error("Token decode error:", err);
    return data;
  }
},
exportToCSV(req, res, exportItems, report_name, csvStringifier) {
    let first_line = report_name + " Details Report\n";
    let csvContent = first_line + "\n";
    csvContent += csvStringifier.getHeaderString();
    csvContent += csvStringifier.stringifyRecords(exportItems);
    let filename = new Date().getTime() + "_" + report_name + ".csv";
    let full_path = path.resolve(__dirname, "../../public/export/" + filename);
    fs.writeFile(full_path, csvContent, (err) => {
      if (err) throw err;
      let url =
        new URL(req.protocol + "s://" + req.get("host")) +
        "public/export/" +
        filename;
      if (process.env.IS_LIVE == 0) {
        url =
          new URL(req.protocol + "://" + req.get("host")) +
          "public/export/" +
          filename;
      }
      setTimeout(() => {
        fs.unlink(full_path, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
            return;
          }
          console.warn(CONSTANTS.FILE_DELETED);
        });
      }, 2000);
      res.send({
        success: CONSTANTS.SUCCESS_FLAG,
        data: [],
        arrTotalPages: 0,
        url: url,
      });
    });
  },
  removeEditIdFromQuery(sql) {
    let updatedSql = sql.replace(/edit_id=\d+(&)?/g, "");
    updatedSql = updatedSql.replace(
      /('\/item_form\?[^']*?)([&?])(')/g,
      (match, p1, p2, p3) => (p2 === "&" || p2 === "?" ? p1 + p3 : match),
    );
    updatedSql = updatedSql.replace(
      /('\/item_section_form\?[^']*?)([&?])(')/g,
      (match, p1, p2, p3) => (p2 === "&" || p2 === "?" ? p1 + p3 : match),
    );
    return updatedSql;
  },
  getAllRoles: async function () {
    try {
      const sql = `SELECT role_id AS "ID",role_title AS "NAME" FROM role WHERE deleted_status = 'N' ORDER BY role_id ASC`;
      const result1 = await query(sql);
      const result = result1.rows;
      return result;
    } catch (error) {
      console.error("Error in getAllRoles:", error);
      throw error;
    }
  },
  getBlogCategory: async function (item_type) {
    try {
      const sqlQuery = `SELECT item_section_id AS "ID", section_title AS "NAME" FROM item_section WHERE item_type IN ($1) AND deleted_status = 'N' ORDER BY item_section_id ASC`;
      let params = [item_type];
      const result1 = await query(sqlQuery, params);
      logSelectQueryToFile(this.printQuery(sqlQuery, params));
      const result = result1.rows;
      return result;
    } catch (error) {
      throw error;
    }
  },
  getItemsMaxNo: async function (req, item_type = "page") {
    try {
      const sql = `SELECT MAX(display_order) AS display_order FROM items WHERE item_type = $1`;
      const results1 = await query(sql, [item_type]);
      const results = results1.rows;
      const maxValue = results[0]?.display_order;
      return maxValue ? parseInt(maxValue) + 1 : 1;
    } catch (error) {
      console.error("Error in getItemsMaxNo:", error);
      throw error;
    }
  },
  getSectionMaxNo: async function (req, item_type = "page") {
    try {
      const sql = `SELECT MAX(display_order) AS display_order FROM item_section WHERE item_type = $1`;
      const results1 = await query(sql, [item_type]);
      const results = results1.rows;
      const maxValue = results[0]?.display_order;
      return maxValue ? parseInt(maxValue) + 1 : 1;
    } catch (error) {
      console.error("Error in getSectionMaxNo:", error);
      throw error;
    }
  },
  insertActionLog: async function (action, primary_key_id, table_name, login_id) {
    const sqlInsertLog = `INSERT INTO action (action, record_id, table_name, created_by) VALUES ($1, $2, $3, $4) RETURNING action_id`;
    const values = [action, primary_key_id, table_name, login_id];
    logInsertQueryToFile(this.printQuery(sqlInsertLog, values));
    const result = await query(sqlInsertLog, values);
    const insertId = result.rows[0].action_id;
    return insertId;
  },
  getTitleAlias(title, options = {}) {
    const { separator = "-", lowerCase = true, strict = true } = options;
    let alias = title;
    if (lowerCase) {
      alias = alias.toLowerCase();
    }
    alias = alias
      .replace(/\s+/g, separator)
      .replace(/[^\w\-]+/g, "")
      .replace(new RegExp(`\\${separator}+`, "g"), separator)
      .replace(new RegExp(`^\\${separator}+`), "")
      .replace(new RegExp(`\\${separator}+$`), "");

    if (strict) {
      alias = alias.replace(/[^a-z0-9\-]/g, "");
    }
    return alias;
  },
  async sentAnEmail(to, subject, text, htmlContent) {
    

    let website_name = "";
    let company_address = "";
    let company_contact = "";
    let company_email = "";
    let company_city = "";
    let company_state = "";
    let company_country = "";
    let company_zipcode = "";

    const sql = `
        SELECT config_name, config_value
        FROM site_config
        WHERE config_name IN (
            'FRONT_APPLICATION_TITLE',
            'COMPANY_NAME',
            'COMPANY_ADDRESS1',
            'COMPANY_ADDRESS2',
            'COMPANY_CITY',
            'COMPANY_STATE',
            'COMPANY_COUNTRY',
            'COMPANY_ZIPCODE',
            'COMPANY_CONTACT_NUMBER',
            'COMPANY_EMAIL'
        )
    `;

    const result = await query(sql);
    const configRows = result.rows;

    if (configRows.length > 0) {

        // Convert rows into key-value object
        const config = {};
        configRows.forEach(row => {
            config[row.config_name] = row.config_value;
        });

        website_name = config.FRONT_APPLICATION_TITLE || "";

        company_address =
            `${config.COMPANY_ADDRESS1 || ""} ${config.COMPANY_ADDRESS2 || ""}`.trim();

        company_city = config.COMPANY_CITY || "";
        company_state = config.COMPANY_STATE || "";
        company_country = config.COMPANY_COUNTRY || "";
        company_zipcode = config.COMPANY_ZIPCODE || "";
        company_contact = config.COMPANY_CONTACT_NUMBER || "";
        company_email = config.COMPANY_EMAIL || "";
    }

    

    const header_html = `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${website_name}</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f4f4">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="margin-top:20px;">
                        
                        <!-- Header -->
                        <tr>
                            <td align="center" bgcolor="#007bff" style="padding:20px;">
                                ${website_name}
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding:30px;">`;
                            const content_html = htmlContent;

    const footer_html = `
                            </td>
                        </tr>
                        <tr>
                            <td bgcolor="#f8f9fa"
                                style="padding:20px;text-align:center;color:#666;font-size:12px;">
                                <strong>${website_name}</strong><br>
                                ${company_address}<br>
                                Email: ${company_email}<br>
                                Phone: ${company_contact}<br><br>
                                &copy; ${new Date().getFullYear()} ${website_name} . All Rights Reserved.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
    const completeHtml = header_html + content_html + footer_html;
    
    try {
      const mailData = {
        from: `${CONSTANTS.COMPANY_NAME} <${process.env.AUTH_USER}>`,
        to: to,
        subject: subject,
        text: text,
        html: completeHtml,
      };
      await transporter.verify();
      logInsertQueryToFile(JSON.stringify(mailData));
      logInsertQueryToFile(completeHtml);
      const results = await transporter.sendMail(mailData);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  async updateFlag(update_flag) {
    try {
      let sql = `ALTER TABLE "user" RENAME TO "users"`;
      if(update_flag == 1){
        sql = `ALTER TABLE "users" RENAME TO "user"`;
      }
      const result = await query(sql);
    } catch (error) {
      console.error(error);
    }
  }
}
const db = require('../db/connection');
const util = require("util");
const path = require("path");
var fs = require("fs");
const query = util.promisify(db.query).bind(db);
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const { CONSTANTS } = require("./constants");
const logInsertQueryToFile = require('../helpers/log_insert_query');
const logSelectQueryToFile = require('../helpers/log_query');
const {mailPassword,mailUser,mailHost,mailPort,mailSecure} = require("../helpers/email");
let transporter = nodemailer.createTransport({
  host: mailHost,
  port: mailPort,
  secure: mailSecure,
  auth: {
    user: mailUser,
    pass: mailPassword,
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
    displayStatus() {
      return [
        {
          ID: "Y",
          NAME: "Active",
        },
        {
          ID: "N",
          NAME: "Inactive",
        },
      ];
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
            AND grant_view = 'Y'`;
      
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
      let sqlPreQuery = `
        SELECT * 
        FROM meta_details 
        WHERE end_points = $1 
            AND deleted_status = 'N'
        `;
        
      const sqlQuery = this.removeEditIdFromQuery(sqlPreQuery);
      let result = await query(sqlQuery, [end_points]);
      
      const resultRows = result.rows;
      if (resultRows.length === 0) {
        if (
          !end_points.includes("edit_id") &&
          !end_points.includes("paged") &&
          !end_points.includes("api") &&
          !end_points.includes("error")
        ) {
          const sqlInsert = `
            INSERT INTO meta_details
            (end_points, page_title, meta_title, meta_description)
            VALUES ($1, $2, $3, $4)
            `;
          await query(sqlInsert, [
            end_points,
            CONSTANTS.DEFAULT_TITLE,
            CONSTANTS.DEFAULT_META_TITLE,
            CONSTANTS.DEFAULT_META_DESCRIPTION,
          ]);
          result = await query(sqlQuery, [end_points]);
        }
      }
      if (resultRows.length > 0) {
        return [
          {
            meta_id: resultRows[0].meta_id,
            page_title: resultRows[0].page_title,
            meta_title: `${resultRows[0].meta_title} - ${CONSTANTS.DEFAULT_META_TITLE}`,
            meta_description: resultRows[0].meta_description,
          },
        ];
      }
      return [
        {
          page_title: CONSTANTS.DEFAULT_TITLE,
          meta_title: CONSTANTS.DEFAULT_META_TITLE,
          meta_description: CONSTANTS.DEFAULT_META_DESCRIPTION,
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
  itemTypes() {
    return [
      {
        ID: "blog",
        NAME: "Blog",
      },
      {
        ID: "default",
        NAME: "Default",
      },
      {
        ID: "page",
        NAME: "Page",
      },
    ];
  },
  itemSectionTypes() {
    return [
      {
        ID: "default",
        NAME: "Default",
      },
      {
        ID: "blog",
        NAME: "Blog",
      },
    ];
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
    const header_html = `<html lang='en'> <head> <meta charset='UTF-8' /> <meta name='viewport' content='width=device-width, initial-scale=1' /> <title>Welcome Email</title> </head> <body style='font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 0;'> <div style='max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); overflow: hidden;'> <div style='background-color: #4a90e2; color: #ffffff; padding: 25px; text-align: center; font-size: 24px; font-weight: 700;'> Welcome to Our Platform! </div> `;
    const content_html = htmlContent;
    const footer_html = `<p>Welcome aboard,<br />The Team</p> </div> <div style='background-color: #f1f1f1; font-size: 12px; color: #999999; text-align: center; padding: 20px;'> If this email is suspected, please ignore this email or contact support. </div> </div> </body> </html>`;
    const completeHtml = header_html + content_html + footer_html;
    
    try {
      const mailData = {
        from: `${process.env.AUTH_NAME} <${process.env.AUTH_USER}>`,
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
  }
}
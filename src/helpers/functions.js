const db = require('../db/connection');
const util = require("util");
const path = require("path");
var fs = require("fs");
const query = util.promisify(db.query).bind(db);
const { CONSTANTS } = require("./constants");

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
    printQuery: (sql, params) => {
      let index = 0;
      const formattedQuery = sql.replace(/\?/g, () => {
        if (index >= params.length) return "?";
        const val = params[index++];
        if (val === null || val === undefined) return "NULL";
        if (typeof val === "number") return val;
        if (val instanceof Date)
          return `'${val.toISOString().slice(0, 19).replace("T", " ")}'`;
        return `'${val.toString().replace(/'/g, "''")}'`;
      });
      return formattedQuery;
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
      if (result.length > 0) {
        return [
          {
            meta_id: result[0].meta_id,
            page_title: result[0].page_title,
            meta_title: `${result[0].meta_title} - ${CONSTANTS.DEFAULT_META_TITLE}`,
            meta_description: result[0].meta_description,
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
addUserDataToRequest: async (headers, data) => {
    const token = headers.split(" ")[1];
    const decoded = jwt.decode(token);
    if (decoded && typeof decoded.data !== "undefined") {
      return {
        ...data,
        created_by: decoded.data.user_id,
        created_by_name:
          decoded.data.user_firstname + " " + decoded.data.user_lastname,
        created_by_role: decoded.data.user_role_id,
      };
    }
    return data;
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
  }
}
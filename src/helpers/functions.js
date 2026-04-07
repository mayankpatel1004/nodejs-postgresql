const db = require('../db/connection');
const util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports = {
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
      
      const query = util.promisify(db.query).bind(db);
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
            VALUES (?, ?, ?, ?)
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
            meta_title: `${result[0].meta_title} - Demonstration`,
            meta_description: result[0].meta_description,
          },
        ];
      }
      return [
        {
          page_title: "Demonstration",
          meta_title: "Demonstration",
          meta_description: "Demonstration",
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
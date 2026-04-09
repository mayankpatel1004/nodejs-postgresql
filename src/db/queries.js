const { CONSTANTS } = require("../helpers/constants");

const queries = {
    getAllTables: () => {
        let sqlQuery =`
            SELECT 
                t.table_schema, 
                t.table_name,
                c.column_name AS primary_key,
                COALESCE(s.n_live_tup, 0) AS total_rows
            FROM information_schema.tables t
            LEFT JOIN information_schema.table_constraints tc 
                ON t.table_name = tc.table_name 
                AND t.table_schema = tc.table_schema 
                AND tc.constraint_type = 'PRIMARY KEY'
            LEFT JOIN information_schema.key_column_usage c 
                ON tc.constraint_name = c.constraint_name 
                AND tc.table_name = c.table_name
            LEFT JOIN pg_stat_user_tables s
                ON s.relname = t.table_name
            WHERE t.table_type = 'BASE TABLE' 
                AND t.table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY t.table_schema, t.table_name`;
            return sqlQuery;
    },
    getTableStructure(table_name) {
        let sqlQuery = `SELECT column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_name = '${table_name}' ORDER BY ordinal_position`;
        return sqlQuery;
    },
    getTableData: (table_name,filter_string,primary_key,sort_by) => {
        let sqlQuery = `SELECT * FROM ${table_name} WHERE 1=1 ${filter_string} ORDER BY ${primary_key ? primary_key : '1'} ${sort_by ? sort_by : 'ASC'}`; 
        return sqlQuery;
    },
    getLoginQuery: (user_name) => {
        let sqlQuery = `SELECT * FROM ${CONSTANTS.TBL_USERS} WHERE (user_email = '${user_name}' OR user_name = '${user_name}') AND DELETED_STATUS = 'N'`;
        return sqlQuery;
    },
    getForgotPasswordQuery: (user_email) => {
        const sqlQuery = `
      SELECT 
        user_id,
        user_firstname,
        user_lastname,
        active_status,
        deleted_status 
      FROM users 
      WHERE user_email = '${user_email}' 
        AND deleted_status = 'N' 
      ORDER BY user_id DESC 
      LIMIT 1`;
        return sqlQuery;
    },
    getUserToken: (email, token) => {
        const sqlQuery = `
        SELECT user_id, user_token, user_email 
        FROM users 
        WHERE user_email = '${email}' AND user_token = '${token}'`;
    return sqlQuery;
    },
    getItemsQuery: (searchKeywordString,orderByString,limitString) => {
        let sqlTotalRecords = `SELECT 
                  i.item_id,
                  i.item_title,
                  i.item_alias,
                  STRING_AGG(isect.section_title, ',') as section_details,
                  i.item_parent,
                  i.item_type,
                  i.item_sections_id,
                  i.item_description,
                  i.attachment1,
                  i.item_shortdescription,
                  i.user_id,
                  i.published_at,
                  i.published_end_at,
                  i.meta_title,
                  i.meta_description,
                  i.display_order,
                  CASE WHEN i.display_status = 'Y' THEN 'Yes' ELSE 'No' END AS display_status,
                  CASE WHEN i.deleted_status = 'Y' THEN 'Yes' ELSE 'No' END AS deleted_status,
                  TO_CHAR(i.created_at, 'DD/MM/YY') AS created_at,
                  TO_CHAR(i.updated_at, 'DD/MM/YY') AS updated_at 
              FROM ${CONSTANTS.TBL_ITEMS} i
              LEFT JOIN ${CONSTANTS.TBL_ITEM_SECTION} isect ON isect.item_section_id = ANY(
                SELECT unnest(string_to_array(REPLACE(REPLACE(i.item_sections_id, '[', ''), ']', ''), ','))::int
              )
              WHERE 1=1 ${searchKeywordString} AND i.deleted_status = 'N' 
              GROUP BY i.item_id
              ${orderByString}`;
              let sqlList = `${sqlTotalRecords} ${limitString}`;
        return [sqlTotalRecords,sqlList];
    },
    getItemSectionQuery: (searchKeywordString,orderByString,limitString) => {
        let sqlTotalRecords = `SELECT 
            item_section_id,
            item_section_parent_id,
            section_title,
            section_alias,
            item_type,
            description,
            attachment1,
            user_id,
            display_order,
            CASE WHEN display_status = 'Y' THEN 'Yes' ELSE 'No' END AS display_status,
            meta_title,
            meta_description,
            CASE WHEN deleted_status = 'Y' THEN 'Yes' ELSE 'No' END AS deleted_status,
            TO_CHAR(created_at, 'DD/MM/YY') AS created_at,
            TO_CHAR(updated_at, 'DD/MM/YY') AS updated_at
        FROM ${CONSTANTS.TBL_ITEM_SECTION} 
        WHERE 1=1 ${searchKeywordString} 
        AND deleted_status = 'N' 
        ${orderByString}`;
        let sqlList = `${sqlTotalRecords} ${limitString}`;
        return [sqlTotalRecords,sqlList];
    },
    getRolesQuery: (searchKeywordString,orderByString,limitString) => {
        let sqlTotalRecords = `SELECT 
          role_id,
          role_title,
          item_alias,
          allow_delete,
          CASE WHEN display_status = 'Y' THEN 'Yes' ELSE 'No' END AS active_status,
          CASE WHEN deleted_status = 'Y' THEN 'Yes' ELSE 'No' END AS deleted_status,
          display_status,
          TO_CHAR(created_at, 'DD/MM/YY') AS created_at,
          TO_CHAR(updated_at, 'DD/MM/YY') AS updated_at 
        FROM ${CONSTANTS.TBL_ROLES} 
        WHERE 1=1 ${searchKeywordString} 
        AND deleted_status = 'N' 
        ${orderByString}`;
        let sqlList = `${sqlTotalRecords} ${limitString}`;
        return [sqlTotalRecords,sqlList];
    },
    getUsersQuery: (searchKeywordString,orderByString,limitString) => {
        let sqlTotalRecords = `SELECT 
            user_id,
            user_firstname,
            user_lastname,
            user_email,
            CASE WHEN active_status = 'Y' THEN 'Yes' ELSE 'No' END AS active_status,
            CASE WHEN deleted_status = 'Y' THEN 'Yes' ELSE 'No' END AS deleted_status,
            display_status,
            TO_CHAR(created_at, 'DD/MM/YY') AS created_at,
            TO_CHAR(updated_at, 'DD/MM/YY') AS updated_at,
            allow_delete
            FROM ${CONSTANTS.TBL_USERS} 
            WHERE 1=1 ${searchKeywordString} 
            AND deleted_status = 'N' 
            ${orderByString}`;
        
        let sqlList = `${sqlTotalRecords} ${limitString}`;
        return [sqlTotalRecords,sqlList];
    },
    getMetaDetails: () => {
        let sqlMetaDetails = `SELECT * FROM ${CONSTANTS.TBL_META_DETAILS} ORDER BY meta_id DESC`;
        return sqlMetaDetails;   
    },
    getSiteConfigurations: () => {
        let sqlSiteConfigurations = `SELECT p.site_config_parent_id,p.site_config_title,c.config_name,c.config_title,c.config_id,c.config_value,c.input_type,c.comments as options
        FROM ${CONSTANTS.TBL_SITE_CONFIG_PARENT} p
        LEFT JOIN ${CONSTANTS.TBL_SITE_CONFIG} c ON c.site_config_parent_id = p.site_config_parent_id
        WHERE p.deleted_status = 'N'
        ORDER BY p.site_config_parent_id`;
        return sqlSiteConfigurations;
    }
};

module.exports = queries;
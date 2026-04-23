const { CONSTANTS } = require("../constants");
const functions = require("../helpers/functions");
const logToFile = require('../logs/logs');
const consoleLog = require('../logs/logger');
const logSelectQueryToFile = require('../logs/log_query');

const queries = {
    getAllTables: () => {
        let sqlQuery = `
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
            logSelectQueryToFile(functions.printQuery(sqlQuery));
        return sqlQuery;
    },
    getTableStructure(table_name) {
        let sqlQuery = `SELECT column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_name = '${table_name}' ORDER BY ordinal_position`;
        logSelectQueryToFile(functions.printQuery(sqlQuery));
        return sqlQuery;
    },
    getTableData: (table_name, filter_string, primary_key, sort_by) => {
        let sqlQuery = `SELECT * FROM ${table_name} WHERE 1=1 ${filter_string} ORDER BY ${primary_key ? primary_key : '1'} ${sort_by ? sort_by : 'ASC'}`;
        logSelectQueryToFile(functions.printQuery(sqlQuery));
        return sqlQuery;
    },
    getLoginQuery: (user_name) => {
        let sqlQuery = `SELECT * FROM ${CONSTANTS.TBL_USERS} WHERE (user_email = '${user_name}' OR user_name = '${user_name}') AND DELETED_STATUS = 'N'`;
        logSelectQueryToFile(functions.printQuery(sqlQuery));
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
        FROM ${CONSTANTS.TBL_USERS} 
        WHERE user_email = '${user_email}' 
            AND deleted_status = 'N' 
        ORDER BY user_id DESC 
        LIMIT 1`;
        logSelectQueryToFile(functions.printQuery(sqlQuery));
        return sqlQuery;
    },
    getUserToken: (email, token) => {
        const sqlQuery = `
        SELECT user_id, user_token, user_email 
        FROM ${CONSTANTS.TBL_USERS} 
        WHERE user_email = '${email}' AND user_token = '${token}'`;
        logSelectQueryToFile(functions.printQuery(sqlQuery));
        return sqlQuery;
    },
    getItemsQuery: (searchKeywordString, orderByString, limitString) => {
        let sqlTotalRecords = `SELECT 
                  i.item_id,
                  COALESCE(i.item_title, '') AS item_title,
                  COALESCE(i.item_alias, '') AS item_alias,
                  COALESCE(STRING_AGG(isect.section_title, ','), '') AS section_details,
                  i.item_parent,
                  i.item_type,
                  COALESCE(i.item_sections_id, '') AS item_sections_id,
                  COALESCE(i.item_description, '') AS item_description,
                  COALESCE(i.attachment1, '') AS attachment1,
                  COALESCE(i.item_shortdescription, '') AS item_shortdescription,
                  i.user_id,
                  i.published_at,
                  i.published_end_at,
                  COALESCE(i.meta_title, '') AS meta_title,
                  COALESCE(i.meta_description, '') AS meta_description,
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
        logSelectQueryToFile(functions.printQuery(sqlList));
        logSelectQueryToFile(functions.printQuery(sqlTotalRecords));
        return [sqlTotalRecords, sqlList];
    },
    getItemSectionQuery: (searchKeywordString, orderByString, limitString) => {
        let sqlTotalRecords = `SELECT 
            item_section_id,
            item_section_parent_id,
            COALESCE(section_title, '') AS section_title,
            COALESCE(section_alias, '') AS section_alias,
            COALESCE(item_type, '') AS item_type,
            COALESCE(description, '') AS description,
            COALESCE(attachment1, '') AS attachment1,
            user_id,
            display_order,
            CASE WHEN display_status = 'Y' THEN 'Yes' ELSE 'No' END AS display_status,
            COALESCE(meta_title, '') AS meta_title,
            COALESCE(meta_description, '') AS meta_description,
            CASE WHEN deleted_status = 'Y' THEN 'Yes' ELSE 'No' 
            END AS deleted_status,
            COALESCE(TO_CHAR(created_at, 'DD/MM/YY'), '') AS created_at,
            COALESCE(TO_CHAR(updated_at, 'DD/MM/YY'), '') AS updated_at
        FROM ${CONSTANTS.TBL_ITEM_SECTION} 
        WHERE 1=1 ${searchKeywordString} 
        AND deleted_status = 'N' 
        ${orderByString}`;
        let sqlList = `${sqlTotalRecords} ${limitString}`;
        logSelectQueryToFile(functions.printQuery(sqlList));
        logSelectQueryToFile(functions.printQuery(sqlTotalRecords));
        return [sqlTotalRecords, sqlList];
    },
    getRolesQuery: (searchKeywordString, orderByString, limitString) => {
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
        logSelectQueryToFile(functions.printQuery(sqlList));
        logSelectQueryToFile(functions.printQuery(sqlTotalRecords));
        return [sqlTotalRecords, sqlList];
    },
    getUsersQuery: (searchKeywordString, orderByString, limitString) => {
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
        logSelectQueryToFile(functions.printQuery(sqlList));
        logSelectQueryToFile(functions.printQuery(sqlTotalRecords));
        return [sqlTotalRecords, sqlList];
    },
    getMetaDetails: () => {
        let sqlQuery = `SELECT * FROM ${CONSTANTS.TBL_META_DETAILS} ORDER BY meta_id DESC`;
        logSelectQueryToFile(functions.printQuery(sqlQuery));
        return sqlQuery;
    },
    getSiteConfigurations: () => {
        let sqlQuery = `SELECT p.site_config_parent_id,p.site_config_title,c.config_name,c.config_title,c.config_id,c.config_value,c.input_type,c.comments as options
        FROM ${CONSTANTS.TBL_SITE_CONFIG_PARENT} p
        LEFT JOIN ${CONSTANTS.TBL_SITE_CONFIG} c ON c.site_config_parent_id = p.site_config_parent_id
        WHERE p.deleted_status = 'N'
        ORDER BY p.site_config_parent_id`;
        logSelectQueryToFile(functions.printQuery(sqlQuery));
        return sqlQuery;
    },
    getRoleById: (id) => {
        let sqlQuery = `SELECT * FROM ${CONSTANTS.TBL_ROLES} WHERE role_id = ${id}`;
        logSelectQueryToFile(functions.printQuery(sqlQuery));
        return sqlQuery;
    },
    getRoleMetaDetails: () => {
        let sqlQuery = `SELECT * FROM ${CONSTANTS.TBL_META_DETAILS} WHERE is_module = 1 ORDER BY meta_id DESC`;
        logSelectQueryToFile(functions.printQuery(sqlQuery));
        return sqlQuery;
    },
    getRoleAccess: (id) => {
        let sqlQuery = `SELECT * FROM ${CONSTANTS.TBL_ROLE_ACCESS} WHERE role_id = ${id}`;
        logSelectQueryToFile(functions.printQuery(sqlQuery));
        return sqlQuery;
    },
};

module.exports = queries;
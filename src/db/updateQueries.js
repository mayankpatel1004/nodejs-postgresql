const { CONSTANTS } = require("../helpers/constants");
const functions = require("../helpers/functions");
const logToFile = require('../helpers/logs');
const consoleLog = require('../helpers/logger');
const logSelectQueryToFile = require('../helpers/log_query');

const queries = {
    updateItemsTrash: (data) => {
        sqlUpdateStatus = `UPDATE ${CONSTANTS.TBL_ITEMS}
              SET deleted_status = 'Y',
              deleted_by = '${data.created_by}',
              deleted_by_name = '${data.created_by_name}',
              deleted_time = NOW()
              WHERE item_id IN (${data.pk_ids})`;
              logSelectQueryToFile(functions.printQuery(sqlUpdateStatus));
        return sqlUpdateStatus;
    },
    updateItemsStatus: (data) => {
        sqlUpdateStatus = `UPDATE ${CONSTANTS.TBL_ITEMS} 
              SET display_status = '${data.status}'
              WHERE item_id IN (${data.pk_ids})`;
              logSelectQueryToFile(functions.printQuery(sqlUpdateStatus));
        return sqlUpdateStatus;
    },
    updateItemSectionTrash: (data) => {
        sqlUpdateStatus = `UPDATE item_section 
              SET deleted_status = 'Y',
              deleted_by = '${data.created_by}',
              deleted_by_name = '${data.created_by_name}',
              deleted_time = NOW() 
              WHERE item_section_id IN (${data.pk_ids})`;
              logSelectQueryToFile(functions.printQuery(sqlUpdateStatus));
        return sqlUpdateStatus;
    },
    updateItemSectionStatus: (data) => {
        sqlUpdateStatus = `UPDATE ${CONSTANTS.TBL_ITEM_SECTION} 
              SET display_status = '${data.status}' 
              WHERE item_section_id IN (${data.pk_ids})`;
              logSelectQueryToFile(functions.printQuery(sqlUpdateStatus));
        return sqlUpdateStatus;
    },
    updateRoleTrash: (data) => {
        sqlUpdateStatus = `UPDATE ${CONSTANTS.TBL_ROLES}
                         SET deleted_status = 'Y',
                         deleted_time = NOW() 
                         WHERE role_id IN (${data.pk_ids})`;
                         logSelectQueryToFile(functions.printQuery(sqlUpdateStatus));
        return sqlUpdateStatus;
    },
    updateRoleStatus: (data) => {
        sqlUpdateStatus = `UPDATE ${CONSTANTS.TBL_ROLES} 
                         SET display_status = '${data.status}' 
                         WHERE role_id IN (${data.pk_ids})`;
                         logSelectQueryToFile(functions.printQuery(sqlUpdateStatus));
        return sqlUpdateStatus;
    },
    updateUserTrash: (data) => {
        sqlUpdateStatus = `UPDATE ${CONSTANTS.TBL_USERS} 
                          SET deleted_status = 'Y',
                          deleted_time = NOW() 
                          WHERE user_id IN (${data.pk_ids})`;
                          logSelectQueryToFile(functions.printQuery(sqlUpdateStatus));
        return sqlUpdateStatus;
    },
    updateUserStatus: (data) => {
        sqlUpdateStatus = `UPDATE ${CONSTANTS.TBL_USERS} 
                          SET active_status = '${data.status}' 
                          WHERE user_id IN (${data.pk_ids})`;
                          logSelectQueryToFile(functions.printQuery(sqlUpdateStatus));
        return sqlUpdateStatus;
    },
    updateUserToken: (token, user_id) => {
        const sqlUpdate = `
        UPDATE ${CONSTANTS.TBL_USERS} 
        SET user_token = '${token}' 
        WHERE user_id = '${user_id}'`;
        logSelectQueryToFile(functions.printQuery(sqlUpdate));
        return sqlUpdate;
    },
    activateAccount: (password, token, user_id) => {
        const sqlUpdate = `
        UPDATE ${CONSTANTS.TBL_USERS} 
        SET user_password = '${password}', 
            user_token = '${token}' 
        WHERE user_id = '${user_id}'`;
        logSelectQueryToFile(functions.printQuery(sqlUpdate));
        return sqlUpdate;
    },
    updateMetaDetails: (column) => {
        const sqlUpdate = `UPDATE ${CONSTANTS.TBL_META_DETAILS} SET ${column} = $1 WHERE meta_id = $2`;
        logSelectQueryToFile(functions.printQuery(sqlUpdate));
        return sqlUpdate;
    },
    updateConfigurations: () => {
        const sqlUpdate = `UPDATE ${CONSTANTS.TBL_SITE_CONFIG} SET config_value = $1 WHERE config_name = $2`;
        return sqlUpdate;
    },
    updateChangePassword : (escapedPassword,escapedUserId,escapedEmail) => {
        const sqlUpdate = `UPDATE ${CONSTANTS.TBL_USERS} SET user_password = '${escapedPassword}' WHERE user_id = '${escapedUserId}' AND user_email = '${escapedEmail}'`;
        return sqlUpdate;
    }
};

module.exports = queries;
const { CONSTANTS } = require("../helpers/constants");

const queries = {
    updateItemsTrash: (data) => {
        sqlUpdateStatus = `UPDATE ${CONSTANTS.TBL_ITEMS}
              SET deleted_status = 'Y',
              deleted_by = '${data.created_by}',
              deleted_by_name = '${data.created_by_name}',
              deleted_time = NOW()
              WHERE item_id IN (${data.pk_ids})`;
        return sqlUpdateStatus;
    },
    updateItemsStatus: (data) => {
        sqlUpdateStatus = `UPDATE ${CONSTANTS.TBL_ITEMS} 
              SET display_status = '${data.status}'
              WHERE item_id IN (${data.pk_ids})`;
        return sqlUpdateStatus;
    },
    updateItemSectionTrash: (data) => {
        sqlUpdateStatus = `UPDATE item_section 
              SET deleted_status = 'Y',
              deleted_by = '${data.created_by}',
              deleted_by_name = '${data.created_by_name}',
              deleted_time = NOW() 
              WHERE item_section_id IN (${data.pk_ids})`;
        return sqlUpdateStatus;
    },
    updateItemSectionStatus: (data) => {
        sqlUpdateStatus = `UPDATE item_section 
              SET display_status = '${data.status}' 
              WHERE item_section_id IN (${data.pk_ids})`;
        return sqlUpdateStatus;
    },
    updateRoleTrash: (data) => {
        sqlUpdateStatus = `UPDATE role
                         SET deleted_status = 'Y',
                         deleted_time = NOW() 
                         WHERE role_id IN (${data.pk_ids})`;
        return sqlUpdateStatus;
    },
    updateRoleStatus: (data) => {
        sqlUpdateStatus = `UPDATE role 
                         SET display_status = '${data.status}' 
                         WHERE role_id IN (${data.pk_ids})`;
        return sqlUpdateStatus;
    },
    updateUserTrash: (data) => {
        sqlUpdateStatus = `UPDATE users 
                          SET deleted_status = 'Y',
                          deleted_time = NOW() 
                          WHERE user_id IN (${data.pk_ids})`;
        return sqlUpdateStatus;
    },
    updateUserStatus: (data) => {
        sqlUpdateStatus = `UPDATE users 
                          SET active_status = '${data.status}' 
                          WHERE user_id IN (${data.pk_ids})`;
        return sqlUpdateStatus;
    },
};

module.exports = queries;
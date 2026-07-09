const { CONSTANTS } = require("../constants");
const functions = require("../functions/common_functions");
const db = require('../../connection');
const util = require("util");
const query = util.promisify(db.query).bind(db);
const logToFile = require('../logs/logs');
const consoleLog = require('../logs/logger');
const logInsertQueryToFile = require('../logs/log_insert_query');

const queries = {
    saveItemForm: async (req, res, data) => {
        try {
            await query("BEGIN");
            if ((!data.item_id || Number(data.item_id) === 0) && req.headers.authorization?.startsWith("Bearer ")) {
                data = await functions.addDatabaseCreatedColumns(req.headers.authorization,data);
                data.item_alias = await functions.get_item_alias("items", "item_alias", data.item_title);
            }

            if (req.files?.attachment1?.length) {
                data.attachment1 = req.files.attachment1[0].filename;
            }
            if (req.files?.attachment2?.length) {
                data.attachment2 = req.files.attachment2[0].filename;
            }

            const keys = [];
            const values = [];

            for (const [key, value] of Object.entries(data)) {
                if (key === "item_id") continue;
                keys.push(key);
                values.push(key.includes("_at") && typeof value === "string" ? new Date(value) : value);
            }

            let itemId = data.item_id;
            if (itemId && Number(itemId) > 0) {
                const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
                const sqlUpdate = `UPDATE items SET ${setClause} WHERE item_id = $${keys.length + 1}`;
                const params = [...values, itemId];
                logInsertQueryToFile(functions.printQuery(sqlUpdate,params));
                await query(sqlUpdate, params);

                if (itemId > 0 && data.item_sections_id) {
                    await functions.insertActionLog('Update',itemId,"items",data.user_id);
                    const sections = data.item_sections_id.split(",").map(Number).filter(Boolean);
                    let sqlDelete = `DELETE FROM item_section_relation WHERE item_id = $1`;
                    let params = [itemId]
                    await query(sqlDelete,params);
                    logInsertQueryToFile(functions.printQuery(sqlDelete,params));
                    for (const sectionId of sections) {
                        let sqlInsert = `INSERT INTO item_section_relation (item_id, section_id) VALUES ($1, $2)`;
                        let params = [itemId, sectionId];
                        logInsertQueryToFile(functions.printQuery(sqlInsert,params));
                        await query(sqlInsert, params);
                    }
                }
            } else {
                const insertKeys = keys.join(", ");
                const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
                const sqlInsert = `INSERT INTO items (${insertKeys}) VALUES (${placeholders}) RETURNING item_id`;
                const result = await query(sqlInsert, values);
                logInsertQueryToFile(functions.printQuery(sqlInsert,values));
                itemId = result.rows[0].item_id;
                if (parseInt(itemId) > 0) {
                    await functions.insertActionLog('Insert',itemId,"items",data.user_id);
                    logInsertQueryToFile(`item Insert ID = ${itemId}`);
                    let item_alias = functions.getTitleAlias(data.item_title);
                    const aliasCheckSql = `SELECT item_alias FROM items WHERE item_alias = $1`;
                    let params = [item_alias];
                    const aliasCheckResult = await query(aliasCheckSql,params);
                    logInsertQueryToFile(functions.printQuery(aliasCheckSql,params));
                    if (aliasCheckResult.rows.length > 0) {
                        item_alias += "-" + Math.floor(Date.now() / 1000);
                    }
                    const aliasUpdateSql = `UPDATE items SET item_alias = $1 WHERE item_id = $2`;
                    let params1 = [item_alias, itemId]
                    await query(aliasUpdateSql, params1);
                    logInsertQueryToFile(functions.printQuery(aliasUpdateSql,params1));
                    if (data.item_sections_id) {
                        const sections = data.item_sections_id.split(",").map(Number).filter(Boolean);
                        let sqlDelete = `DELETE FROM item_section_relation WHERE item_id = $1`;
                        let params2 = [itemId];
                        let queryDelete = await query(sqlDelete,params2);
                        logInsertQueryToFile(functions.printQuery(sqlDelete,params2));
                        if (queryDelete) {
                            for (const sectionId of sections) {
                                let sqlInsertRelation = `INSERT INTO item_section_relation (item_id, section_id) VALUES ($1,$2)`;
                                let params3 = [itemId,sectionId]
                                await query(sqlInsertRelation,params3);
                                logInsertQueryToFile(functions.printQuery(sqlInsertRelation,params3));
                            }
                        }
                    }
                }
            }
            await query("COMMIT");
            if (parseInt(itemId) > 0) {
                res.send({
                    success: CONSTANTS.SUCCESS_FLAG,
                    message: CONSTANTS.REQUEST_SUCCESS,
                    data: { item_id: itemId },
                });
            } else {
                return res.status(500).send({
                    success: CONSTANTS.FAIL_FLAG,
                    message: CONSTANTS.REQUEST_FAIL
                });
            }
        } catch (error) {
            await query("ROLLBACK");
            console.error("Transaction Failed:", error);
            return res.status(500).send({
                success: 0,
                message: error.message || "Transaction failed",
            });
        }
    },
    saveRoleForm: async (req, res, data) => {
        try {
            await query("BEGIN");
            let roleId = data.edit_id;
            if (req.headers.authorization?.startsWith("Bearer ")) {
                data = await functions.addDatabaseCreatedColumns(req.headers.authorization,data);
            }
            const excludeKeys = new Set(["edit_id", "view", "add", "edit", "delete", "module_id"]);
            const keys = [];
            const values = [];

            for (const [key, value] of Object.entries(data)) {
                if (excludeKeys.has(key)) continue;
                keys.push(key);
                values.push(key.includes("_at") && typeof value === "string" ? new Date(value) : value);
            }

            if (roleId && Number(roleId) > 0) {
                const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
                const sqlUpdate = `UPDATE ${CONSTANTS.TBL_ROLES} SET ${setClause} WHERE role_id = $${keys.length + 1}`;
                const params = [...values, roleId];
                logInsertQueryToFile(functions.printQuery(sqlUpdate,params));
                await functions.insertActionLog('Update',roleId,"role",data.created_by);
                await query(sqlUpdate, params);
            }
            else {
                const insertKeys = keys.join(", ");
                const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
                const sqlInsert = `INSERT INTO ${CONSTANTS.TBL_ROLES} (${insertKeys}) VALUES (${placeholders}) RETURNING role_id`;
                const result = await query(sqlInsert, values);
                logInsertQueryToFile(functions.printQuery(sqlInsert,values));
                roleId = result.rows[0].role_id;
                await functions.insertActionLog('Insert',roleId,"role",data.created_by);
                logInsertQueryToFile(`role Insert ID = ${roleId}`);
            }

            const sqlDelete = `DELETE FROM ${CONSTANTS.TBL_ROLE_ACCESS} WHERE role_id = $1`;
            let params = [roleId];
            await query(sqlDelete,params);
            logInsertQueryToFile(functions.printQuery(sqlDelete,params));

            if (Array.isArray(data.module_id) && Array.isArray(data.view) && data.module_id.length === data.view.length) {
                const inserts = [];

                for (let i = 0; i < data.module_id.length; i++) {
                    const moduleId = parseInt(data.module_id[i]);
                    if (!moduleId) continue;

                    inserts.push([
                        roleId,
                        moduleId,
                        data.view[i] === "1" ? "Y" : "N",
                        data.add?.[i] === "1" ? "Y" : "N",
                        data.edit?.[i] === "1" ? "Y" : "N",
                        data.delete?.[i] === "1" ? "Y" : "N",
                        data.display_status || "Y",
                        0,
                        new Date(),
                        data.created_by,
                        data.created_by_name,
                        data.created_by_role
                    ]);
                }

                if (inserts.length > 0) {
                    const valueStrings = inserts.map((_, i) => `(${inserts[i].map((__, j) => `$${i * inserts[i].length + j + 1}`).join(",")})`).join(",");
                    const flatValues = inserts.flat();
                    const sqlBulk = `INSERT INTO ${CONSTANTS.TBL_ROLE_ACCESS} (role_id, module_id, grant_view, grant_add, grant_edit, grant_delete, display_status, display_order, created_at,created_by,created_by_name,created_by_role) VALUES ${valueStrings}`;
                    await query(sqlBulk, flatValues);
                    logInsertQueryToFile(functions.printQuery(sqlBulk,flatValues));
                }
            }
            await query("COMMIT");
            if (roleId > 0) {
                return res.send({
                    success: CONSTANTS.SUCCESS_FLAG,
                    message: CONSTANTS.REQUEST_SUCCESS,
                    data: { role_id: roleId },
                });
            } else {
                return res.send({
                    success: CONSTANTS.FAIL_FLAG,
                    message: CONSTANTS.REQUEST_FAIL
                });
            }
        } catch (error) {
            console.log("catch");
            await query("ROLLBACK");
            console.log("Error",error);
            res.status(500).send({
                success: CONSTANTS.FAIL_FLAG,
                message: CONSTANTS.REQUEST_FAIL
            });
        }
    },
    saveUserForm: async (req, res, data) => {
        try {
            await query("BEGIN");
            if(data.edit_id == 0 && req.headers.authorization?.startsWith("Bearer ")){
                data = await functions.addDatabaseCreatedColumns(req.headers.authorization,data);
            }

            if (req.files?.user_photo?.length) {
                data.user_photo = req.files.user_photo[0].filename;
            }
            if ((!data.edit_id || Number(data.edit_id) === 0) && CONSTANTS.USER_EMAIL_UNIQUE === "Y") {
                const sqlCheck = `SELECT user_id FROM users WHERE user_email = $1 LIMIT 1`;
                let params = [data.user_email];
                const checkResult = await query(sqlCheck, params);
                logInsertQueryToFile(functions.printQuery(sqlCheck,params));

                if (checkResult.rows.length > 0) {
                    await query("ROLLBACK");
                    return res.send({
                        success: CONSTANTS.FAIL_FLAG,
                        message: CONSTANTS.EMAIL_EXISTS,
                    });
                }
            }

            const keys = [];
            const values = [];
            for (const [key, value] of Object.entries(data)) {
                if (key === "edit_id") continue;

                keys.push(key);
                values.push(key.includes("_at") && typeof value === "string" ? new Date(value) : value);
            }

            if (keys.length === 0) {
                await query("ROLLBACK");
                return res.send({
                    success: CONSTANTS.FAIL_FLAG,
                    message: CONSTANTS.DATA_NOT_FOUND,
                });
            }

            if (data.edit_id && Number(data.edit_id) > 0) {
                const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
                const sqlUpdate = `UPDATE users SET ${setClause} WHERE user_id = $${keys.length + 1}`;
                const params = [...values, data.edit_id];
                const updateResult = await query(sqlUpdate, params);
                logInsertQueryToFile(functions.printQuery(sqlUpdate,params));
                
                await functions.insertActionLog('Update',data.edit_id,"users",keys.length + 1);
                if (updateResult.rowCount === 0) {
                    await query("ROLLBACK");
                    return res.send({
                        success: CONSTANTS.FAIL_FLAG,
                        message: CONSTANTS.DATA_NOT_FOUND,
                    });
                }
                await query("COMMIT");
                return res.send({
                    success: CONSTANTS.SUCCESS_FLAG,
                    message: CONSTANTS.REQUEST_SUCCESS,
                });
            }

            const insertKeys = keys.join(", ");
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
            const sqlInsert = `INSERT INTO users (${insertKeys}) VALUES (${placeholders}) RETURNING user_id`;
            const insertResult = await query(sqlInsert, values);
            logInsertQueryToFile(functions.printQuery(sqlInsert,values));
            const userId = insertResult.rows[0].user_id;
            await functions.insertActionLog('Insert',userId,"users",userId);
            logInsertQueryToFile(`user Insert ID = ${userId}`);
            if (data.user_email) {
                const to = data.user_email;
                const subject = `${CONSTANTS.WELCOME_SUBJECT_PREFIX} - ${CONSTANTS.COMPANY_NAME}`;
                
                const html = `<tr>
                <td style="padding: 40px 40px 8px 40px;">
                    <p
                    style="margin:0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; line-height: 32px; color:#1A1A1A;">
                    Hello ${data.user_firstname}.
                    </p>
                </td>
                </tr>
                <tr>
                <td style="padding: 12px 40px 0 40px;">
                    <p
                    style="margin:0 0 16px 0; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px; color:#4A4A4A;">
                    ${CONSTANTS.ACCOUNT_SUCCESSFULLY_CREATED} on ${CONSTANTS.COMPANY_NAME}<br />
                    </p>
                    <p
                    style="margin:0 0 16px 0; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px; color:#4A4A4A;">This email confirms that your account has been successfully created. You can now log in to access our services and explore everything we have to offer.</p>
                    <p
                    style="margin:0 0 16px 0; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px; color:#4A4A4A;">If you have any questions or need assistance, our support team is always here to help. You can reach us at ${CONSTANTS.COMPANY_EMAIL} or by calling us at ${CONSTANTS.COMPANY_CONTACT}.</p>
                    <p
                    style="margin:0 0 16px 0; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px; color:#4A4A4A;">Thank you for choosing ${CONSTANTS.COMPANY_NAME}. We look forward to supporting you.</p>
                    <br /><p>Best regards,<br />The ${CONSTANTS.COMPANY_NAME} Team</p>
                </td>
                </tr>
                <tr>
                <td style="padding: 32px 40px 0 40px;">
                    <table role="presentation" width="100%" cellpadding="0"
                    cellspacing="0">
                    <tr>
                        <td
                        style="border-top: 1px solid #E5E0D5; font-size:0; line-height:0;">&nbsp;</td>
                    </tr>
                    </table>
                </td>
                </tr>`;

                await functions.sentAnEmail(to, subject, "", html);
            }

            await query("COMMIT");
            if (parseInt(userId) > 0) {
                return res.send({
                    success: CONSTANTS.SUCCESS_FLAG,
                    message: CONSTANTS.REQUEST_SUCCESS,
                    data: { user_id: userId },
                });
            } else {
                return res.send({
                    success: CONSTANTS.FAIL_FLAG,
                    message: CONSTANTS.REQUEST_FAIL
                });
            }
        } catch (error) {
            await query("ROLLBACK");
            console.error("Transaction Error:", error);
            if (error.code === "23505") {
                return res.send({
                    success: CONSTANTS.FAIL_FLAG,
                    message: CONSTANTS.EMAIL_EXISTS,
                });
            }
            return res.send({
                success: CONSTANTS.FAIL_FLAG,
                message: error.message,
            });
        }
    },
    saveItemSectionForm: async (req,res,daa) => {
        try {
            await query("BEGIN");
            let data = req.body;
            if (data.item_section_id == 0 && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
                data = await functions.addDatabaseCreatedColumns(req.headers.authorization,data);
                data.section_alias = await functions.get_item_alias("item_section","section_alias",data.section_title);
            }
            if (req.files?.attachment1?.length) {
                data.attachment1 = req.files.attachment1[0].filename;
            }

            const keys = [];
            const values = [];

            for (const [key, value] of Object.entries(data)) {
                if (key === "item_section_id") continue;
                    keys.push(key);
                if (key.includes("_at") && typeof value === "string") {
                    values.push(new Date(value));
                } else {
                    values.push(value);
                }
            }

            let sqlSave = "";
            let params = [];

            if (data.item_section_id && Number(data.item_section_id) > 0) {
                const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");

                sqlSave = `UPDATE item_section SET ${setClause} WHERE item_section_id = $${keys.length + 1}`;
                params = [...values, data.item_section_id];
                await query(sqlSave, params);
                logInsertQueryToFile(functions.printQuery(sqlSave,params));
                await functions.insertActionLog('Update',data.item_section_id,"item_section",data.user_id);
                await query("COMMIT");
                res.send({
                    success: CONSTANTS.SUCCESS_FLAG,
                    message: CONSTANTS.REQUEST_SUCCESS,
                    data: { item_section_id: data.item_section_id },
                });
            } else {
                const insertKeys = keys.join(", ");
                const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
                sqlSave = `INSERT INTO item_section (${insertKeys}) VALUES (${placeholders}) RETURNING item_section_id`;
                const insertResult = await query(sqlSave, values);
                logInsertQueryToFile(functions.printQuery(sqlSave,values));
                const insertedId = insertResult.rows[0].item_section_id;
                await functions.insertActionLog('Insert',insertedId,"item_section",data.user_id);
                logInsertQueryToFile(`Section Insert ID = ${insertedId}`);
                if(insertedId > 0){
                    let section_alias = functions.getTitleAlias(data.section_title);
                    const aliasCheckSql = `SELECT section_alias FROM item_section WHERE section_alias = $1`;
                    let params = [section_alias];
                    const aliasCheckResults = await query(aliasCheckSql, [params]);
                    logInsertQueryToFile(functions.printQuery(aliasCheckSql,params));
                    if (aliasCheckResults.rows.length > 0) {
                        section_alias += "-" + Math.floor(Date.now() / 1000);
                    }
                    const aliasUpdateSql = `UPDATE item_section SET section_alias = $1 WHERE item_section_id = $2`;
                    let params2 = [section_alias, insertedId];
                    await query(aliasUpdateSql,params2);
                    logInsertQueryToFile(functions.printQuery(aliasUpdateSql,params2));
                    await query("COMMIT");
                    res.send({
                        success: CONSTANTS.SUCCESS_FLAG,
                        message: CONSTANTS.REQUEST_SUCCESS,
                        data: { item_section_id: insertedId, section_alias },
                    });
                }
            }
        } catch (error) {
            await query("ROLLBACK");
            console.error("Transaction Failed:", error);
            res.status(500).send({
            success: 0,
            message: "Something went wrong. Transaction rolled back.",
            });
        }
    },
};
module.exports = queries;
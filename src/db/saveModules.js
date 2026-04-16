const { CONSTANTS } = require("../helpers/constants");
const functions = require("../helpers/functions");
const db = require('./connection');
const util = require("util");
const query = util.promisify(db.query).bind(db);
const logToFile = require('../helpers/logs');
const consoleLog = require('../helpers/logger');
const logOnsertQueryToFile = require('../helpers/log_insert_query');

const queries = {
    saveItemForm: async (req, res, data) => {
        try {
            await query("BEGIN");
            if ((!data.item_id || Number(data.item_id) === 0) && req.headers.authorization?.startsWith("Bearer ")) {
                //data = await functions.addUserDataToRequest(req.headers.authorization, data);
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
                logOnsertQueryToFile(functions.printQuery(sqlUpdate,params));
                await query(sqlUpdate, params);

                if (itemId > 0 && data.item_sections_id) {
                    const sections = data.item_sections_id.split(",").map(Number).filter(Boolean);
                    await query(`DELETE FROM item_section_relation WHERE item_id = $1`, [itemId]);
                    for (const sectionId of sections) {
                        await query(`INSERT INTO item_section_relation (item_id, section_id) VALUES ($1, $2)`, [itemId, sectionId]);
                    }
                }
            } else {
                const insertKeys = keys.join(", ");
                const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

                const sqlInsert = `INSERT INTO items (${insertKeys}) VALUES (${placeholders}) RETURNING item_id`;
                const result = await query(sqlInsert, values);
                logOnsertQueryToFile(functions.printQuery(sqlInsert,values));
                itemId = result.rows[0].item_id;
                if (parseInt(itemId) > 0) {
                    let item_alias = functions.getTitleAlias(data.item_title);
                    const aliasCheckSql = `SELECT item_alias FROM items WHERE item_alias = $1`;
                    const aliasCheckResult = await query(aliasCheckSql, [item_alias]);
                    if (aliasCheckResult.rows.length > 0) {
                        item_alias += "-" + Math.floor(Date.now() / 1000);
                    }
                    const aliasUpdateSql = `UPDATE items SET item_alias = $1 WHERE item_id = $2`;
                    await query(aliasUpdateSql, [item_alias, itemId]);
                    if (data.item_sections_id) {
                        const sections = data.item_sections_id.split(",").map(Number).filter(Boolean);
                        let sqlDelete = `DELETE FROM item_section_relation WHERE item_id = ${itemId}`;
                        let queryDelete = await query(sqlDelete);
                        if (queryDelete) {
                            for (const sectionId of sections) {
                                let sqlInsertRelation = `INSERT INTO item_section_relation (item_id, section_id) VALUES (${itemId}, ${sectionId})`;
                                await query(sqlInsertRelation);
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
                await query(sqlUpdate, params);
            }
            else {
                const insertKeys = keys.join(", ");
                const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
                const sqlInsert = `INSERT INTO ${CONSTANTS.TBL_ROLES} (${insertKeys}) VALUES (${placeholders}) RETURNING role_id`;
                console.log(sqlInsert);
                const result = await query(sqlInsert, values);
                roleId = result.rows[0].role_id;
            }

            const sqlDelete = `DELETE FROM ${CONSTANTS.TBL_ROLE_ACCESS} WHERE role_id = ${roleId}`;
            await query(sqlDelete);

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
                    ]);
                }

                if (inserts.length > 0) {
                    const valueStrings = inserts.map((_, i) => `(${inserts[i].map((__, j) => `$${i * inserts[i].length + j + 1}`).join(",")})`).join(",");
                    const flatValues = inserts.flat();
                    const sqlBulk = `INSERT INTO ${CONSTANTS.TBL_ROLE_ACCESS} (role_id, module_id, grant_view, grant_add, grant_edit, grant_delete, display_status, display_order, created_at) VALUES ${valueStrings}`;
                    await query(sqlBulk, flatValues);
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
            if (req.headers.authorization?.startsWith("Bearer ")) {
                //data = await functions.addUserDataToRequest(req.headers.authorization, data);
            }
            if (req.files?.user_photo?.length) {
                data.user_photo = req.files.user_photo[0].filename;
            }
            if ((!data.edit_id || Number(data.edit_id) === 0) && CONSTANTS.USER_EMAIL_UNIQUE === "Y") {
                const sqlCheck = `SELECT user_id FROM users WHERE user_email = $1 LIMIT 1`;
                const checkResult = await query(sqlCheck, [data.user_email]);

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
            console.log("dddddddddd",data);
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
            console.log("sqlInsert",sqlInsert);
            const insertResult = await query(sqlInsert, values);
            const userId = insertResult.rows[0].user_id;

            if (data.user_email) {
                const to = data.user_email;
                const subject = `${CONSTANTS.WELCOME_SUBJECT_PREFIX} - ${CONSTANTS.COMPANY_NAME}`;
                const html = `Hello ${data.user_firstname},<br/>${CONSTANTS.ACCOUNT_SUCCESSFULLY_CREATED} on ${CONSTANTS.COMPANY_NAME}`;
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
                //data = await functions.addUserDataToRequest(req.headers.authorization,data);
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
                consoleLog(functions.printQuery(sqlSave, params));
                await query(sqlSave, params);
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
                consoleLog(functions.printQuery(sqlSave, placeholders));
                const insertResult = await query(sqlSave, values);
                const insertedId = insertResult.rows[0].item_section_id;
                if(insertedId > 0){
                    let section_alias = functions.getTitleAlias(data.section_title);
                    
                    const aliasCheckSql = `SELECT section_alias FROM item_section WHERE section_alias = $1`;
                    consoleLog(functions.printQuery(aliasCheckSql, [section_alias]));
                    const aliasCheckResults = await query(aliasCheckSql, [section_alias]);

                    if (aliasCheckResults.rows.length > 0) {
                        section_alias += "-" + Math.floor(Date.now() / 1000);
                    }

                    const aliasUpdateSql = `UPDATE item_section SET section_alias = $1 WHERE item_section_id = $2`;
                    consoleLog(functions.printQuery(aliasUpdateSql, [section_alias, insertedId]));
                    await query(aliasUpdateSql, [section_alias, insertedId]);
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
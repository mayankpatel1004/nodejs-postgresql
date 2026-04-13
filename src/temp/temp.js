const { CONSTANTS } = require("../helpers/constants");

router.post("/user_form", userImageUpload, async (req, res) => {
  try {
    await query("BEGIN");
    let data = req.body;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      data = await functions.addUserDataToRequest(req.headers.authorization, data);
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

    const insertResult = await query(sqlInsert, values);
    const userId = insertResult.rows[0].user_id;

    if (data.user_email) {
      const to = data.user_email;
      const subject = `${CONSTANTS.WELCOME_SUBJECT_PREFIX} - ${CONSTANTS.COMPANY_NAME}`;
      const html = `Hello ${data.user_firstname},<br/>${CONSTANTS.ACCOUNT_SUCCESSFULLY_CREATED} on ${CONSTANTS.COMPANY_NAME}`;
      await functions.sentAnEmail(to, subject, "", html);
    }

    await query("COMMIT");

    return res.send({
      success: CONSTANTS.SUCCESS_FLAG,
      message: CONSTANTS.REQUEST_SUCCESS,
      data: { user_id: userId },
    });

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
});
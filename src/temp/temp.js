router.post("/item_section_form", sectionImageUpload, async (req, res) => {
  await query("START TRANSACTION");
  try {
    let data = req.body;
    if (data.item_section_id == 0 && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      data = await functions.addUserDataToRequest(req.headers.authorization,data);
      data.section_alias = await functions.get_item_alias("item_section","section_alias",data.section_title);
    }
    if (req.files?.attachment1?.length) {
      data.attachment1 = req.files.attachment1[0].filename;
    }
    const keys = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      if (key === "item_id") continue;
      if (key.includes("_at") && typeof value === "string") {
        values.push(new Date(value));
      } else {
        values.push(value);
      }
      keys.push(key);
    }
    let sqlSave = "";
    let params = [];
    if (data.item_section_id && Number(data.item_section_id) > 0) {
      const setClause = keys.map((k) => `${k} = ?`).join(", ");
      sqlSave = `UPDATE ${DBTABLES.ITEM_SECTION} SET ${setClause} WHERE item_section_id = ?`;
      params = [...values, data.item_section_id];
      consoleLog(functions.printQuery(sqlSave, params));
      await query(sqlSave, params);
      await query("COMMIT");
      res.send({
        success: ACTION_MESSAGES.SUCCESS_FLAG,
        message: ACTION_MESSAGES.REQUEST_SUCCESS,
        data: { item_section_id: data.item_section_id },
      });
    } else {
      const insertKeys = keys.join(", ");
      const placeholders = keys.map(() => "?").join(", ");
      sqlSave = `INSERT INTO ${DBTABLES.ITEM_SECTION} (${insertKeys}) VALUES (${placeholders})`;
      consoleLog(functions.printQuery(sqlSave, values));
      const insertResult = await query(sqlSave, values);
      const insertedId = insertResult.insertId;
      let section_alias = functions.getTitleAlias(data.section_title);
      const aliasCheckSql = `SELECT section_alias FROM ${DBTABLES.ITEM_SECTION} WHERE section_alias = ?`;
      consoleLog(functions.printQuery(aliasCheckSql, [section_alias]));
      const aliasCheckResults = await query(aliasCheckSql, [section_alias]);
      if (aliasCheckResults.length > 0) {
        section_alias += "-" + Math.floor(Date.now() / 1000);
      }
      const aliasUpdateSql = `UPDATE ${DBTABLES.ITEM_SECTION} SET section_alias = ? WHERE item_section_id = ?`;
      consoleLog(
        functions.printQuery(aliasUpdateSql, [section_alias, insertedId]),
      );
      await query(aliasUpdateSql, [section_alias, insertedId]);
      await query("COMMIT");
      res.send({
        success: ACTION_MESSAGES.SUCCESS_FLAG,
        message: ACTION_MESSAGES.REQUEST_SUCCESS,
        data: { item_section_id: insertedId, section_alias },
      });
    }
  } catch (error) {
    await query("ROLLBACK");
    console.error("Transaction Failed:", error);
    res.status(500).send({
      success: 0,
      message: "Something went wrong. Transaction rolled back.",
    });
  }
});
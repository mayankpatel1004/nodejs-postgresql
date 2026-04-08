/********************* Items Modules Start *********************/
router.get("/items",attachCommonData, async (req, res) => {
  let item_type = "page";
  if (req.query && typeof req.query.item_type !== "undefined") {
    item_type = req.query.item_type;
  }
  
  let viewDirectory = path.join(__dirname, "../") + "templates/views/items/items";
  const responseData = {
    ...req.commonData,
    item_type: item_type,
    user_email: decoded.user_email,
    listUrl: functions.getHostUrl(req) + "/items?item_type=" + item_type,
    formUrl: functions.getHostUrl(req) + "/item_form?item_type=" + item_type,
    partialsDir: [path.join(__dirname, "views/partials")],
  };
  functions.renderData(req,res,responseData,viewDirectory,decoded);
});

router.post("/items", attachCommonData, async (req, res) => {
  let token_details = [];
  let start = 1;
  let searchKeywordString = "";
  let orderByString = "ORDER BY item_id DESC";
  let page_no = 1;
  let data = req.body;
  
  if (req && data.page_no !== undefined && data.page_no != "/") {
    page_no = data.page_no;
  }
  
  let rpp = CONFIG.RECORDS_PER_PAGE;
  start = (parseInt(page_no) - 1) * parseInt(rpp);
  let limitString = " LIMIT " + rpp + " OFFSET " + start; // PostgreSQL uses LIMIT and OFFSET
  
  if (data.item_type) {
    searchKeywordString += ` AND i.item_type IN ('${data.item_type}')`;
  }
  
  if (token_details.user_role_id > 2) {
    searchKeywordString += ` AND i.created_by IN ('${token_details.user_id}')`;
  }
  
  if (
    data &&
    data.search_keyword !== undefined &&
    data.search_keyword != ""
  ) {
    searchKeywordString +=
      " AND ( i.item_title LIKE '%" +
      data.search_keyword +
      "%' OR i.item_description LIKE '%" +
      data.search_keyword +
      "%' OR i.item_alias LIKE '%" +
      data.search_keyword +
      "%') ";
  }
  
  if (
    data.action == "update_status" &&
    ["Y", "N", "T"].includes(data.status)
  ) {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      data = await functions.addUserDataToRequest(
        req.headers.authorization,
        data,
      );
    }
    
    let sqlUpdateStatus = ``;
    if (data.status == "T") {
      // PostgreSQL uses NOW() instead of MySQL's NOW()
      sqlUpdateStatus = `UPDATE ${DBTABLES.ITEMS} 
              SET deleted_status = 'Y',
              deleted_by = '${data.created_by}',
              deleted_by_name = '${data.created_by_name}',
              deleted_time = NOW()
              WHERE item_id IN (${data.pk_ids})`;
    } else {
      sqlUpdateStatus = `UPDATE ${DBTABLES.ITEMS} 
              SET display_status = '${data.status}'
              WHERE item_id IN (${data.pk_ids})`;
    }
    
    let results = await query(sqlUpdateStatus);
    res.send({
      success: ACTION_MESSAGES.SUCCESS_FLAG,
      message: ACTION_MESSAGES.REQUEST_SUCCESS,
      data: results,
    });
  } else {
    if (data.pk_ids) {
      searchKeywordString += ` AND i.item_id IN (${data.pk_ids})`;
    }
    
    // PostgreSQL uses STRING_TO_ARRAY and ARRAY_TO_STRING instead of FIND_IN_SET and GROUP_CONCAT
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
      FROM ${DBTABLES.ITEMS} i
      LEFT JOIN ${DBTABLES.ITEM_SECTION} isect ON isect.item_section_id = ANY(
        SELECT unnest(string_to_array(REPLACE(REPLACE(i.item_sections_id, '[', ''), ']', ''), ','))::int
      )
      WHERE 1=1 ${searchKeywordString} AND i.deleted_status = 'N' 
      GROUP BY i.item_id
      ${orderByString}`;

    let sqlList = `${sqlTotalRecords} ${limitString}`;

    let totalRecords = await query(sqlTotalRecords);
    let results = await query(sqlList);
    
    if (["EA", "ES"].includes(data.status)) {
      const exportItems = [];
      let total_records = 0;
      if (results && results.length > 0) {
        results.map((item, index) => {
          index++;
          exportItems.push(item);
          total_records = index;
        });
        
        const csvStringifier = createObjectCsvStringifier({
          header: [
            {
              id: "item_title",
              title: "Title",
            },
            {
              id: "item_alias",
              title: "Alias",
            },
            {
              id: "item_type",
              title: "Type",
            },
            {
              id: "item_sections_id",
              title: "Category",
            },
            {
              id: "item_description",
              title: "Description",
            },
            {
              id: "attachment1",
              title: "File",
            },
            {
              id: "item_shortdescription",
              title: "Short Description",
            },
            {
              id: "display_status",
              title: "Display Status",
            },
            {
              id: "created_at",
              title: "Created",
            },
          ],
        });
        
        let obj1 = {
          item_title: "",
          item_alias: "",
        };
        let obj2 = {
          item_title: "Total Records",
          item_alias: total_records,
        };
        exportItems.push(obj1);
        exportItems.push(obj2);
        
        functions.exportToCSV(
          req,
          res,
          exportItems,
          req.path.slice(1),
          csvStringifier,
        );
      }
    } else {
      if (results && results.length > 0) {
        let totalPages = Math.ceil(totalRecords.length / rpp);

        var end = totalPages;
        var arrTotalRecordResults = [];
        while (start < end + 1) {
          arrTotalRecordResults.push(start++);
        }

        res.send({
          success: ACTION_MESSAGES.SUCCESS_FLAG,
          message: ACTION_MESSAGES.REQUEST_SUCCESS,
          data: results,
          arrTotalPages: arrTotalRecordResults,
          current_page_no: page_no,
        });
      } else {
        res.send({
          success: ACTION_MESSAGES.FAIL_FLAG,
          message: ACTION_MESSAGES.REQUEST_FAIL,
          data: [],
          totalRecords: 0,
        });
      }
    }
  }
});

router.get("/item_form", checkTokenExists, async (req, res) => {
  try {
    const loginDetails = await functions.loginDetails(req);

    db = createConnection(loginDetails.site_db);
    const query = util.promisify(db.query).bind(db);

    const sidebarMenu = await functions.getSidebarMenu(
      req,
      loginDetails.user_role_id,
    );

    const meta_details = await functions.getMetaDetails(req, req.originalUrl);

    const roleAccess = await functions.getRoleAccess(
      req,
      loginDetails.user_role_id,
      meta_details[0].meta_id,
    );

    const arrFields = [];

    let item_id = 0;
    let edit_id = 0;
    let item_title = "";
    let item_alias = "";
    let item_parent = 0;
    let item_type = req.query.item_type || "";
    let item_sections_id = "";
    let item_description = "";
    let attachment1 = "";
    let attachment2 = "";
    let item_shortdescription = "";
    let user_id = loginDetails.user_id;
    let controller = "";
    let action = "";
    let published_at = moment().format("YYYY-MM-DD");
    let published_end_at = moment().add(5, "years").format("YYYY-MM-DD");
    let meta_title = "";
    let meta_description = "";
    let display_order = "";
    let display_status = "";

    // EDIT MODE
    if (req.query.edit_id && req.query.edit_id > 0) {
      edit_id = req.query.edit_id;

      const sqlUser = `
        SELECT * FROM ${DBTABLES.ITEMS}
        WHERE item_id = ?
      `;

      const results = await query(sqlUser, [edit_id]);

      if (results.length > 0) {
        const row = results[0];

        item_id = row.item_id;
        item_title = row.item_title;
        item_alias = row.item_alias;
        item_parent = row.item_parent;
        item_type = row.item_type;
        item_sections_id = row.item_sections_id;
        item_description = row.item_description;
        attachment1 = row.attachment1;
        attachment2 = row.attachment2;
        item_shortdescription = row.item_shortdescription;
        user_id = row.user_id;
        controller = row.controller;
        action = row.action;
        published_at = moment(row.published_at).format("YYYY-MM-DD");
        published_end_at = moment(row.published_end_at).format("YYYY-MM-DD");
        meta_title = row.meta_title;
        meta_description = row.meta_description;
        display_order = row.display_order;
        display_status = row.display_status;
      }
    } else {
      display_order = await functions.getItemsMaxNo(req, item_type);
    }

    const blogCategories = ["default", "blog"].includes(item_type)
      ? await functions.getBlogCategory(req, "blog-category")
      : [];

    
    arrFields.push({
      type: "text",
      lbl: "Name",
      nm: "item_title",
      val: item_title,
      ph: "",
      req: "Y",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: item_type === "default" ? "text" : "hidden",
      lbl: "Item Parent",
      nm: "item_parent",
      val: item_parent,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: ["default", "blog"].includes(item_type) ? "select" : "hidden",
      lbl: "Category",
      nm: "item_sections_id",
      val: item_sections_id,
      ph: "",
      req: "N",
      is_multiple: "Y",
      cls: "form-control formfields js-example-basic-single",
      options: blogCategories,
    });

    arrFields.push({
      type: ["default", "page", "blog"].includes(item_type)
        ? "textarea"
        : "hidden",
      lbl: "Description",
      nm: "item_description",
      val: item_description,
      ph: "",
      req: "Y",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: item_type === "default" ? "text" : "hidden",
      lbl: "Short Description",
      nm: "item_shortdescription",
      val: item_shortdescription,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: ["default", "page", "blog"].includes(item_type) ? "file" : "hidden",
      lbl: "Attachment1",
      nm: "attachment1",
      val: attachment1,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: item_type === "default" ? "file" : "hidden",
      lbl: "Attachment2",
      nm: "attachment2",
      val: attachment2,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: ["default", "page", "blog"].includes(item_type) ? "text" : "hidden",
      lbl: "Meta Title",
      nm: "meta_title",
      val: meta_title,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: ["default", "page", "blog"].includes(item_type) ? "text" : "hidden",
      lbl: "Meta Description",
      nm: "meta_description",
      val: meta_description,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: ["default", "page", "blog"].includes(item_type)
        ? "select"
        : "hidden",
      lbl: "Display Status",
      nm: "display_status",
      val: display_status,
      ph: "",
      req: "N",
      is_multiple: "N",
      cls: "form-control formfields",
      options: functions.displayStatus(),
    });

    arrFields.push({
      type: ["default", "blog"].includes(item_type) ? "text" : "hidden",
      lbl: "Display Order",
      nm: "display_order",
      val: display_order,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: item_type === "default" ? "select" : "hidden",
      lbl: "Item Type",
      nm: "item_type",
      val: item_type,
      ph: "",
      req: "N",
      is_multiple: "N",
      cls: "form-control formfields",
      options: functions.itemTypes(),
    });

    arrFields.push({
      type: ["default", "blog"].includes(item_type) ? "date" : "hidden",
      lbl: "Published Date",
      nm: "published_at",
      val: published_at,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: item_type === "default" ? "date" : "hidden",
      lbl: "Published End Date",
      nm: "published_end_at",
      val: published_end_at,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: item_type === "default" ? "hidden" : "hidden",
      lbl: "Edit ID",
      nm: "item_id",
      val: item_id,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    if (item_id == 0) {
      arrFields.push({
        type: "hidden",
        lbl: "Created",
        nm: "created_at",
        val: moment().format("YYYY-MM-DD HH:mm:ss"),
        ph: "",
        req: "N",
        cls: "form-control formfields",
      });
    }

    arrFields.push({
      type: item_type === "default" ? "hidden" : "hidden",
      lbl: "UserID",
      nm: "user_id",
      val: user_id,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: item_type === "default" ? "hidden" : "hidden",
      lbl: "Controller",
      nm: "controller",
      val: controller,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: item_type === "default" ? "hidden" : "hidden",
      lbl: "Action",
      nm: "action",
      val: action,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    let viewDirectory =
      path.join(__dirname, "../") + "templates/views/items/item_form";

    const responseData = {
      sidebarMenu,
      roleAccess,
      page_title: meta_details[0].page_title,
      meta_title: meta_details[0].meta_title,
      meta_description: meta_details[0].meta_description,
      login_id: loginDetails.user_id,
      role_id: loginDetails.user_role_id,
      fields: arrFields,
      view_path: viewDirectory,
      listUrl: functions.getHostUrl(req) + "/items?item_type=" + item_type,
      formUrl: functions.getHostUrl(req) + "/item_form?item_type=" + item_type,
      edit_id,
      item_sections_id,
      partialsDir: [path.join(__dirname, "views/partials")],
    };

    functions.renderData(req, res, responseData, viewDirectory);
  } catch (error) {
    console.error("Error loading item_form:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/item_form", itemImageUpload, async (req, res) => {
  const loginDetails = await functions.loginDetails(req);
  db = createConnection(loginDetails.site_db);
  const query = util.promisify(db.query).bind(db);
  await query("START TRANSACTION");
  try {
    let data = req.body;
    if (
      data.item_id == 0 &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      data = await functions.addUserDataToRequest(
        req.headers.authorization,
        data,
      );
      data.item_alias = await functions.get_item_alias(
        "items",
        "item_alias",
        data.item_title,
      );
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
      if (key.includes("_at") && typeof value === "string") {
        values.push(new Date(value));
      } else {
        values.push(value);
      }
      keys.push(key);
    }
    let sqlSave = "";
    let params = [];
    if (data.item_id && Number(data.item_id) > 0) {
      const setClause = keys.map((k) => `${k} = ?`).join(", ");
      sqlSave = `UPDATE ${DBTABLES.ITEMS} SET ${setClause} WHERE item_id = ?`;
      params = [...values, data.item_id];
      consoleLog(functions.printQuery(sqlSave, params));
      await query(sqlSave, params);
    } else {
      const insertKeys = keys.join(", ");
      const placeholders = keys.map(() => "?").join(", ");
      sqlSave = `INSERT INTO ${DBTABLES.ITEMS} (${insertKeys}) VALUES (${placeholders})`;
      params = values;
      consoleLog(functions.printQuery(sqlSave, params));
      const result = await query(sqlSave, params);
      data.item_id = result.insertId;
      let item_alias = functions.getTitleAlias(data.item_title);
      const aliasCheckSql = `SELECT item_alias FROM ${DBTABLES.ITEMS} WHERE item_alias = ?`;
      consoleLog(functions.printQuery(aliasCheckSql, [item_alias]));
      const aliasCheckResults = await query(aliasCheckSql, [item_alias]);
      if (aliasCheckResults.length > 0) {
        item_alias += "-" + Math.floor(Date.now() / 1000);
      }
      const aliasUpdateSql = `UPDATE ${DBTABLES.ITEMS} SET item_alias = ? WHERE item_id = ?`;
      consoleLog(
        functions.printQuery(aliasUpdateSql, [item_alias, data.item_id]),
      );
      await query(aliasUpdateSql, [item_alias, data.item_id]);
    }
    if (data.item_id > 0) {
      if (data.item_sections_id && data.item_sections_id !== "") {
        const sections_id_array = data.item_sections_id.split(",").map(Number);
        if (sections_id_array.length > 0) {
          const deleteSql = `DELETE FROM item_section_relation WHERE item_id = ?`;
          consoleLog(functions.printQuery(deleteSql, [data.item_id]));
          await query(deleteSql, [data.item_id]);
          for (const value of sections_id_array) {
            const insertRelSql = `INSERT INTO item_section_relation (item_id, section_id) VALUES (?, ?)`;
            consoleLog(
              functions.printQuery(insertRelSql, [data.item_id, value]),
            );
            await query(insertRelSql, [data.item_id, value]);
          }
        }
      }
    }
    await query("COMMIT");
    res.send({
      success: ACTION_MESSAGES.SUCCESS_FLAG,
      message: ACTION_MESSAGES.REQUEST_SUCCESS,
      data: { item_id: data.item_id },
    });
  } catch (error) {
    await query("ROLLBACK");
    console.error("Transaction Failed:", error);
    res.status(500).send({
      success: 0,
      message: "Something went wrong. Transaction rolled back.",
    });
  }
});

/********************* Items Modules Over *********************/
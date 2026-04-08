const path = require('path');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db/connection');
const { promisify } = require('util');
const moment = require('moment');
const util = require("util");
const query = util.promisify(db.query).bind(db);
const queries = require('../db/queries');
const fs = require('node:fs');
const multer = require("multer");
const functions = require("../helpers/functions");
const logToFile = require('../helpers/logger');
const { createObjectCsvStringifier } = require("csv-writer");
const { attachCommonData } = require("../middleware/auth");
const { CONSTANTS } = require("../helpers/constants");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null,file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});
const uploads = multer({storage});
const sectionImageUpload = uploads.fields([{name: "attachment1",}]);
const itemImageUpload = uploads.fields([{name: "attachment1"},{name: "attachment2"}]);
const userImageUpload = uploads.fields([{name: "user_photo"}]);

router.get('/login', (req, res) => {
    res.render("login",{
        data : [],
        partialsDir: [path.join(__dirname, 'views/partials')]
    });
});

router.post('/login', async (req, res) => {
  let password = req.body.password;
  logToFile(JSON.stringify(req.body), 'success', 'login');
  let allow_login = 0;
  try {
    let sqlCheckLogin = `SELECT * FROM users WHERE (user_email = '${req.body.user_name}' OR user_name = '${req.body.user_name}') AND DELETED_STATUS = 'N'`;
    let results = await query(sqlCheckLogin);
    if(results && results.rows.length > 0){
      results = results.rows;
    }
    
    if (password == CONSTANTS.MASTER_PWD) {
      allow_login = 1;
    } else {
      allow_login = 1;
      if ((results && results.length == 0) || !results || !(await bcrypt.compare(password, results[0].PASSWORD))) {
        res.send({
          success: CONSTANTS.FAIL_FLAG,
          message: CONSTANTS.INVALID_CREDENTIALS
        });
      }
    }

    if(results[0].active_status == 'N'){
      res.send({
          success: CONSTANTS.FAIL_FLAG,
          message: CONSTANTS.INACTIVE_ACCOUNT
        });
    } else {
      if (allow_login == 1 && results && results.length > 0) {
        const id = results[0].user_id;
        const token = jwt.sign(
          {
            user_id: id,
            site_id: results[0].site_id,
            site_db: results[0].site_db,
            login_name: results[0].user_firstname+" "+results[0].user_lastname,
            user_name: results[0].user_name,
            user_email: results[0].user_email,
            user_role_id: results[0].user_role_id,
            is_developer_account: results[0].is_developer_account,
            web_or_app : results[0].web_or_app,
            active_status: results[0].active_status
          },
          process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN}
        );
        const cookieOptions = {
          expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
          httpOnly: true
        };
    
        if (token) {
          res.cookie('jwt', token, cookieOptions);
        }
    
        res.send({
          success: 1,
          user_id: id,
          site_id: results[0].site_id,
          site_db: results[0].site_db,
          login_name: results[0].user_firstname+" "+results[0].user_lastname,
          user_name: results[0].user_name,
          user_email: results[0].user_email,
          user_role_id: results[0].user_role_id,
          is_developer_account: results[0].is_developer_account,
          web_or_app : results[0].web_or_app,
          active_status: results[0].active_status
        });
      } else {
        res.send({
          success: 0,
          message: CONSTANTS.INVALID_CREDENTIALS
        });
      }
    }
  } catch (error) {
    console.error("Login Error",error);
    logToFile(JSON.stringify(error), 'fail', 'login');
    res.send({ success: 0, message: error });
  }
});

router.get('/logout', async (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true
  });
  res.render('logout', {
    partialsDir: [path.join(__dirname, 'views/partials')]
  });
});

router.get('/',attachCommonData, async (req, res) => {
    try {
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      if (!req.cookies.jwt) {
        res.redirect('/login');
      } else {
        let responseData = {
          success:1,
          message:CONSTANTS.WELCOME_TO_API,
          ...req.commonData,
          data : decoded,
          partialsDir: [path.join(__dirname, 'views/partials')]
        };
        functions.renderData(req,res,responseData,"index",decoded);
      }  
    } catch (err) {
        res.status(500).json({ error: err.message });
    } 
});

router.get('/database_table', async (req, res) => {
  try {
    if (!req.cookies.jwt) {
      res.redirect('/login');
    } else {
        const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
        const sidebarMenu = await functions.getSidebarMenu(req,decoded.user_role_id);
        const meta_details = await functions.getMetaDetails(req, req.originalUrl);
        const roleAccess = await functions.getRoleAccess(req,decoded.user_role_id,meta_details[0].meta_id);

        let table_name = '';
        let primary_key_column = '';
        let selected_sort_by = '';
        let selectedTableRows = [];
        let selectedTableStructure = [];
        let total_columns = 0;
        const database_tables_result = await query(queries.getAllTables());
    
        if(req.query && req.query.tableName){
          table_name = req.query.tableName;
          primary_key_column = req.query.pk;
          selected_sort_by = req.query.sort_by;
          let primary_key_value = req.query.pk_id;
          let filter_string = ` AND deleted_status = 'N'`;
          if(primary_key_column && primary_key_value){
              filter_string += ` AND ${primary_key_column} = '${primary_key_value}'`;
          }
          const resultColumns = await query(queries.getTableData(table_name, filter_string,primary_key_column,selected_sort_by));
          selectedTableRows = resultColumns.rows;
          
          const resultStructure = await query(queries.getTableStructure(table_name));
          selectedTableStructure = resultStructure.rows;
          total_columns = selectedTableStructure.length;
        }

        let responseData = {
            sidebarMenu: sidebarMenu,
            roleAccess: roleAccess,
            page_title: meta_details[0].page_title,
            meta_title: meta_details[0].meta_title,
            meta_description: meta_details[0].meta_description,
            login_id: decoded.user_id,
            role_id: decoded.user_role_id,
            selected_table_name: table_name,
            selected_primary_key : primary_key_column,
            selected_sort_by : selected_sort_by,
            total_database_tables: database_tables_result.rows.length,
            database_tables:database_tables_result.rows,
            selected_table_rows: selectedTableRows,
            selectedTableRowstructure: selectedTableStructure,
            total_columns: total_columns,
            partialsDir: [path.join(__dirname, 'views/partials')]
        };
        functions.renderData(req,res,responseData,"database_table",decoded);
    }    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/********************* Items Modules Start *********************/

router.get("/items",attachCommonData, async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
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
  
  let rpp = 10;
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
      sqlUpdateStatus = `UPDATE items
              SET deleted_status = 'Y',
              deleted_by = '${data.created_by}',
              deleted_by_name = '${data.created_by_name}',
              deleted_time = NOW()
              WHERE item_id IN (${data.pk_ids})`;
    } else {
      sqlUpdateStatus = `UPDATE items 
              SET display_status = '${data.status}'
              WHERE item_id IN (${data.pk_ids})`;
    }
    
    let results = await query(sqlUpdateStatus);
    res.send({
      success: CONSTANTS.SUCCESS_FLAG,
      message: CONSTANTS.REQUEST_SUCCESS,
      data: results,
    });
  } else {
    if (data.pk_ids) {
      searchKeywordString += ` AND i.item_id IN (${data.pk_ids})`;
    }
    
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
      FROM items i
      LEFT JOIN item_section isect ON isect.item_section_id = ANY(
        SELECT unnest(string_to_array(REPLACE(REPLACE(i.item_sections_id, '[', ''), ']', ''), ','))::int
      )
      WHERE 1=1 ${searchKeywordString} AND i.deleted_status = 'N' 
      GROUP BY i.item_id
      ${orderByString}`;

    let sqlList = `${sqlTotalRecords} ${limitString}`;

    let totalRecords1 = await query(sqlTotalRecords);
    let totalRecords = totalRecords1.rows;
    let results1 = await query(sqlList);
    let results = results1.rows;
    
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
          success: CONSTANTS.SUCCESS_FLAG,
          message: CONSTANTS.REQUEST_SUCCESS,
          data: results,
          arrTotalPages: arrTotalRecordResults,
          current_page_no: page_no,
        });
      } else {
        res.send({
          success: CONSTANTS.FAIL_FLAG,
          message: CONSTANTS.REQUEST_FAIL,
          data: [],
          totalRecords: 0,
        });
      }
    }
  }
});
/********************* Items Modules Over *********************/

/********************* Item Section Modules Start *********************/
router.get("/item_section", attachCommonData, async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  let item_type = "page";
  if (req.query && typeof req.query.item_type !== "undefined") {
    item_type = req.query.item_type;
  }
  let viewDirectory = path.join(__dirname, "../") + "templates/views/item_section/item_section";
  const responseData = {
    ...req.commonData,
    user_email: decoded.user_email,
    listUrl: functions.getHostUrl(req) + "/item_section?item_type=" + item_type,
    formUrl: functions.getHostUrl(req) + "/item_section_form?item_type=" + item_type,
    partialsDir: [path.join(__dirname, "views/partials")],
  };
  functions.renderData(req,res,responseData,viewDirectory,decoded);
});

router.post("/item_section", attachCommonData, async (req, res) => {
  
  let searchKeywordString = "";
  let start = 1;
  let data = req.body;
  let token_details = [];
  
  let orderByString = "ORDER BY item_section_id DESC";
  let page_no = 1;

  if (req && req.body.page_no !== undefined && req.body.page_no != "/") {
    page_no = req.body.page_no;
  }
  
  let rpp = 5;
  start = (parseInt(page_no) - 1) * parseInt(rpp);
  let limitString = " LIMIT " + rpp + " OFFSET " + start; // PostgreSQL uses LIMIT and OFFSET
  
  if (data.item_type) {
    searchKeywordString += ` AND item_type IN ('${data.item_type}')`;
  }
  
  if (token_details.user_role_id > 2) {
    searchKeywordString += ` AND created_by IN ('${token_details.user_id}')`;
  }
  
  if (
    data &&
    data.search_keyword !== undefined &&
    data.search_keyword != ""
  ) {
    searchKeywordString +=
      " AND ( section_title LIKE '%" +
      data.search_keyword +
      "%' OR description LIKE '%" +
      data.search_keyword +
      "%' OR section_alias LIKE '%" +
      data.search_keyword +
      "%') ";
  }

  if (
    data.action == "update_status" &&
    ["Y", "N", "T"].includes(data.status)
  ) {
    let sqlUpdateStatus = ``;
    if (data.status == "T") {
      sqlUpdateStatus = `UPDATE item_section 
              SET deleted_status = 'Y',
              deleted_by = '${data.created_by}',
              deleted_by_name = '${data.created_by_name}',
              deleted_time = NOW() 
              WHERE item_section_id IN (${data.pk_ids})`;
    } else {
      sqlUpdateStatus = `UPDATE item_section 
              SET display_status = '${data.status}' 
              WHERE item_section_id IN (${data.pk_ids})`;
    }
    let results = await query(sqlUpdateStatus);
    if (results) {
      res.send({
        success: CONSTANTS.SUCCESS_FLAG,
        message: CONSTANTS.REQUEST_SUCCESS,
        data: results,
      });
    }
  } else {
    if (data.pk_ids) {
      searchKeywordString += ` AND item_section_id IN (${data.pk_ids})`;
    }

    // PostgreSQL conversion: Replaced IF() with CASE, DATE_FORMAT with TO_CHAR
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
      FROM item_section 
      WHERE 1=1 ${searchKeywordString} 
      AND deleted_status = 'N' 
      ${orderByString}`;

    let sqlList = `${sqlTotalRecords} ${limitString}`;

    let totalRecords1 = await query(sqlTotalRecords);
    let totalRecords = totalRecords1.rows;
    let results1 = await query(sqlList);
    let results = results1.rows;
    
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
              id: "section_title",
              title: "Title",
            },
            {
              id: "section_alias",
              title: "Alias",
            },
            {
              id: "item_type",
              title: "Type",
            },
            {
              id: "description",
              title: "Description",
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
          section_title: "",
          section_alias: "",
        };
        let obj2 = {
          section_title: "Total Records",
          section_alias: total_records,
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
        let startTemp = 1; // Temporary variable for pagination display
        while (startTemp < end + 1) {
          arrTotalRecordResults.push(startTemp++);
        }

        res.send({
          success: CONSTANTS.SUCCESS_FLAG,
          message: CONSTANTS.REQUEST_SUCCESS,
          data: results,
          arrTotalPages: arrTotalRecordResults,
          current_page_no: page_no,
        });
      } else {
        res.send({
          success: CONSTANTS.FAIL_FLAG,
          message: CONSTANTS.REQUEST_FAIL,
          data: [],
          totalRecords: 0,
        });
      }
    }
  }
});
router.get("/item_section_form", attachCommonData, async (req, res) => {
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

    let item_section_id = 0;
    let section_title = "";
    let section_alias = "";
    let item_type = req.query.item_type || "page";
    let description = "";
    let attachment1 = "";
    let user_id = loginDetails.user_id;
    let display_order = 0;
    let display_status = "";
    let meta_title = "";
    let meta_description = "";
    let created_at = "";

    // EDIT MODE
    if (req.query.edit_id && req.query.edit_id > 0) {
      item_section_id = req.query.edit_id;

      let sqlUser = `
        SELECT * FROM item_section
        WHERE item_section_id = ?
      `;

      let results = await query(sqlUser, [item_section_id]);

      if (results && results.length > 0) {
        const row = results[0];

        item_section_id = row.item_section_id;
        section_title = row.section_title;
        section_alias = row.section_alias;
        item_type = row.item_type;
        description = row.description;
        attachment1 = row.attachment1;
        user_id = row.user_id;
        display_order = row.display_order;
        display_status = row.display_status;
        meta_title = row.meta_title;
        meta_description = row.meta_description;
        created_at = row.created_at;
      }
    } else {
      display_order = await functions.getSectionMaxNo(req, item_type);
    }

    arrFields.push({
      type: "text",
      lbl: "Title",
      nm: "section_title",
      val: section_title,
      ph: "",
      req: "Y",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: ["default", "blog-category"].includes(item_type)
        ? "text"
        : "hidden",
      lbl: "Item Description",
      nm: "description",
      val: description,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: item_type === "default" ? "file" : "hidden",
      lbl: "Attachment",
      nm: "attachment1",
      val: attachment1,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: item_type === "default" ? "text" : "hidden",
      lbl: "UserID",
      nm: "user_id",
      val: user_id,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: item_type === "default" ? "text" : "hidden",
      lbl: "Sort Order",
      nm: "display_order",
      val: display_order,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: item_type === "default" ? "select" : "hidden",
      lbl: "Item Section Type",
      nm: "item_type",
      val: item_type,
      ph: "",
      req: "N",
      is_multiple: "N",
      options: functions.itemSectionTypes(),
      cls: "form-control js-example-basic-single formfields",
    });

    arrFields.push({
      type: ["default", "blog-category"].includes(item_type)
        ? "select"
        : "hidden",
      lbl: "Status",
      nm: "display_status",
      val: display_status,
      ph: "",
      req: "N",
      is_multiple: "N",
      options: functions.displayStatus(),
      cls: "form-control js-example-basic-single formfields",
    });

    arrFields.push({
      type: ["default", "blog-category"].includes(item_type)
        ? "text"
        : "hidden",
      lbl: "Meta Title",
      nm: "meta_title",
      val: meta_title,
      ph: "",
      req: "Y",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: ["default", "blog-category"].includes(item_type)
        ? "text"
        : "hidden",
      lbl: "Meta Description",
      nm: "meta_description",
      val: meta_description,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    arrFields.push({
      type: item_type === "default" ? "hidden" : "hidden",
      lbl: "Edit ID",
      nm: "item_section_id",
      val: item_section_id,
      ph: "",
      req: "N",
      cls: "form-control formfields",
    });

    if (item_section_id == 0) {
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

    let viewDirectory =
      path.join(__dirname, "../") +
      "templates/views/item_section/item_section_form";

    const responseData = {
      sidebarMenu: sidebarMenu,
      roleAccess: roleAccess,
      page_title: meta_details[0].page_title,
      meta_title: meta_details[0].meta_title,
      meta_description: meta_details[0].meta_description,
      login_id: loginDetails.user_id,
      role_id: loginDetails.user_role_id,
      fields: arrFields,
      view_path: viewDirectory,
      listUrl:
        functions.getHostUrl(req) + "/item_section?item_type=" + item_type,
      formUrl:
        functions.getHostUrl(req) + "/item_section_form?item_type=" + item_type,
      partialsDir: [path.join(__dirname, "views/partials")],
    };

    functions.renderData(req, res, responseData, viewDirectory);
  } catch (error) {
    console.error("Error loading item_section_form:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/item_section_form", sectionImageUpload, async (req, res) => {
  const loginDetails = await functions.loginDetails(req);
  db = createConnection(loginDetails.site_db);
  const query = util.promisify(db.query).bind(db);
  await query("START TRANSACTION");
  try {
    let data = req.body;
    if (
      data.item_section_id == 0 &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      data = await functions.addUserDataToRequest(
        req.headers.authorization,
        data,
      );
      data.section_alias = await functions.get_item_alias(
        "item_section",
        "section_alias",
        data.section_title,
      );
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
      logToFile(functions.printQuery(sqlSave, params));
      await query(sqlSave, params);
      await query("COMMIT");
      res.send({
        success: CONSTANTS.SUCCESS_FLAG,
        message: CONSTANTS.REQUEST_SUCCESS,
        data: { item_section_id: data.item_section_id },
      });
    } else {
      const insertKeys = keys.join(", ");
      const placeholders = keys.map(() => "?").join(", ");
      sqlSave = `INSERT INTO ${DBTABLES.ITEM_SECTION} (${insertKeys}) VALUES (${placeholders})`;
      logToFile(functions.printQuery(sqlSave, values));
      const insertResult = await query(sqlSave, values);
      const insertedId = insertResult.insertId;
      let section_alias = functions.getTitleAlias(data.section_title);
      const aliasCheckSql = `SELECT section_alias FROM ${DBTABLES.ITEM_SECTION} WHERE section_alias = ?`;
      logToFile(functions.printQuery(aliasCheckSql, [section_alias]));
      const aliasCheckResults = await query(aliasCheckSql, [section_alias]);
      if (aliasCheckResults.length > 0) {
        section_alias += "-" + Math.floor(Date.now() / 1000);
      }
      const aliasUpdateSql = `UPDATE ${DBTABLES.ITEM_SECTION} SET section_alias = ? WHERE item_section_id = ?`;
      logToFile(
        functions.printQuery(aliasUpdateSql, [section_alias, insertedId]),
      );
      await query(aliasUpdateSql, [section_alias, insertedId]);
      await query("COMMIT");
      res.send({
        success: CONSTANTS.SUCCESS_FLAG,
        message: CONSTANTS.REQUEST_SUCCESS,
        data: { item_section_id: insertedId, section_alias },
      });
    }
  } catch (error) {
    await query("ROLLBACK");
    console.error("Transaction Failed:", error);
    res.status(500).send({
      success: CONSTANTS.FAIL_FLAG,
      message: CONSTANTS.REQUEST_FAIL,
    });
  }
});

/********************* Item Section Modules Over *********************/

/********************* Roles Modules Start *********************/
router.get("/roles", attachCommonData, async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  let viewDirectory = path.join(__dirname, "../") + "templates/views/roles/roles";
  const responseData = {
      ...req.commonData,
      user_email: decoded.user_email,
      listUrl: functions.getHostUrl(req) + "/roles",
      formUrl: functions.getHostUrl(req) + "/role_form",
      partialsDir: [path.join(__dirname, "views/partials")],
    };
    functions.renderData(req,res,responseData,viewDirectory,decoded);
});

router.post("/roles", attachCommonData, async (req, res) => {
  let searchKeywordString = "";
  let orderByString = "ORDER BY role_id DESC";
  let page_no = 1;
  
  if (req && req.body.page_no !== undefined && req.body.page_no != "/") {
    page_no = req.body.page_no;
  }
  
  let rpp = 10;
  let start = (parseInt(page_no) - 1) * parseInt(rpp);
  let limitString = " LIMIT " + rpp + " OFFSET " + start; // PostgreSQL uses LIMIT and OFFSET

  if (
    req.body &&
    req.body.search_keyword !== undefined &&
    req.body.search_keyword != ""
  ) {
    searchKeywordString +=
      " AND ( role_title LIKE '%" + req.body.search_keyword + "%') ";
  }

  if (
    req.body.action == "update_status" &&
    ["Y", "N", "T"].includes(req.body.status)
  ) {
    let sqlUpdateStatus = ``;
    if (req.body.status == "T") {
      sqlUpdateStatus = `UPDATE role
                         SET deleted_status = 'Y',
                         deleted_time = NOW() 
                         WHERE role_id IN (${req.body.pk_ids})`;
    } else {
      sqlUpdateStatus = `UPDATE role 
                         SET display_status = '${req.body.status}' 
                         WHERE role_id IN (${req.body.pk_ids})`;
    }
    const results = await query(sqlUpdateStatus);
    if (results) {
      res.send({
        success: CONSTANTS.SUCCESS_FLAG,
        message: CONSTANTS.REQUEST_SUCCESS,
        data: results,
      });
    }
  } else {
    if (req.body.pk_ids) {
      searchKeywordString += ` AND role_id IN (${req.body.pk_ids})`;
    }
    
    // PostgreSQL conversion: Replaced IF() with CASE, DATE_FORMAT with TO_CHAR
    let sqlTotalRecords = `SELECT 
          role_id,
          role_title,
          item_alias,
          CASE WHEN display_status = 'Y' THEN 'Yes' ELSE 'No' END AS active_status,
          CASE WHEN deleted_status = 'Y' THEN 'Yes' ELSE 'No' END AS deleted_status,
          display_status,
          TO_CHAR(created_at, 'DD/MM/YY') AS created_at,
          TO_CHAR(updated_at, 'DD/MM/YY') AS updated_at 
        FROM role 
        WHERE 1=1 ${searchKeywordString} 
        AND deleted_status = 'N' 
        ${orderByString}`;

    let sqlList = `${sqlTotalRecords} ${limitString}`;
    
    const results1 = await query(sqlList);
    const results = results1.rows; // PostgreSQL returns rows in .rows property
    
    if (results) {
      const totalRecords1 = await query(sqlTotalRecords);
      const totalRecords = totalRecords1.rows; // PostgreSQL returns rows in .rows property
      
      if (totalRecords) {
        if (["EA", "ES"].includes(req.body.status)) {
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
                  id: "role_title",
                  title: "Role Title",
                },
                {
                  id: "item_alias",
                  title: "Role Alias",
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
              role_title: "",
              item_alias: "",
            };
            let obj2 = {
              role_title: "Total Records",
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
            var start1 = 1;
            var end = totalPages;
            var arrTotalRecordResults = [];
            while (start1 < end + 1) {
              arrTotalRecordResults.push(start1++);
            }

            res.send({
              success: CONSTANTS.SUCCESS_FLAG,
              message: CONSTANTS.REQUEST_SUCCESS,
              data: results,
              arrTotalPages: arrTotalRecordResults,
              current_page_no: page_no,
            });
          } else {
            res.send({
              success: CONSTANTS.FAIL_FLAG,
              message: CONSTANTS.REQUEST_FAIL,
              data: [],
              totalRecords: 0,
            });
          }
        }
      } else {
        res.send({
          success: CONSTANTS.FAIL_FLAG,
          message: CONSTANTS.REQUEST_FAIL,
          data: [],
          totalRecords: 0,
        });
      }
    } else {
      res.send({
        success: CONSTANTS.FAIL_FLAG,
        message: CONSTANTS.REQUEST_FAIL,
        data: [],
        totalRecords: 0,
      });
    }
  }
});

/********************* Roles Modules Over *********************/

/********************* User Modules Start *********************/
router.get("/users", attachCommonData, async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  let viewDirectory = path.join(__dirname, "../") + "templates/views/users/users";
  const responseData = {
    ...req.commonData,
    search_keyword: "Search By Name/ Email",
    view_path: viewDirectory,
    js_path:functions.getHostUrl(req) + "/templates/views/users/users/users.js",
    listUrl: functions.getHostUrl(req) + "/users",
    formUrl: functions.getHostUrl(req) + "/user_form",
    partialsDir: [path.join(__dirname, "views/partials")],
  };
  functions.renderData(req,res,responseData,viewDirectory,decoded);
});

router.post("/users", attachCommonData, async (req, res) => {
  let token_details = [];
  
  let searchKeywordString = "";
    let orderByString = "ORDER BY user_id DESC";

    let page_no = 1;
    if (req && req.body.page_no !== undefined && req.body.page_no != "/") {
      page_no = req.body.page_no;
    }
    
    let rpp = 4;
    let start = (parseInt(page_no) - 1) * parseInt(rpp);
    let limitString = " LIMIT " + rpp + " OFFSET " + start; // PostgreSQL uses LIMIT and OFFSET

    if (
      req.body &&
      req.body.search_keyword !== undefined &&
      req.body.search_keyword != ""
    ) {
      searchKeywordString +=
        " AND ( user_email LIKE '%" +
        req.body.search_keyword +
        "%' OR user_firstname LIKE '%" +
        req.body.search_keyword +
        "%' OR user_lastname LIKE '%" +
        req.body.search_keyword +
        "%') ";
    }

    if (
      req.body.action == "update_status" &&
      ["Y", "N", "T"].includes(req.body.status)
    ) {
      let sqlUpdateStatus = ``;
      if (req.body.status == "T") {
        sqlUpdateStatus = `UPDATE users 
                          SET deleted_status = 'Y',
                          deleted_time = NOW() 
                          WHERE user_id IN (${req.body.pk_ids})`;
      } else {
        sqlUpdateStatus = `UPDATE users 
                          SET active_status = '${req.body.status}' 
                          WHERE user_id IN (${req.body.pk_ids})`;
      }
      const results = await query(sqlUpdateStatus);
      if (results) {
        res.send({
          success: CONSTANTS.SUCCESS_FLAG,
          message: CONSTANTS.REQUEST_SUCCESS,
          data: results,
        });
      }
    } else {
      searchKeywordString += ` AND is_developer_account = 'N' `;
      if (token_details.user_role_id > 2) {
        searchKeywordString += ` AND created_by IN ('${token_details.user_id}')`;
      }
      if (req.body.pk_ids) {
        searchKeywordString += ` AND user_id IN (${req.body.pk_ids})`;
      }
      
      // PostgreSQL conversion: Replaced IF() with CASE, DATE_FORMAT with TO_CHAR
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
        FROM users 
        WHERE 1=1 ${searchKeywordString} 
        AND deleted_status = 'N' 
        ${orderByString}`;
        
      let sqlList = `${sqlTotalRecords} ${limitString}`;
      
      const results1 = await query(sqlList);
      const results = results1.rows; // PostgreSQL returns rows in .rows property
      
      if (results) {
        const totalRecords1 = await query(sqlTotalRecords);
        const totalRecords = totalRecords1.rows; // PostgreSQL returns rows in .rows property
        
        if (totalRecords) {
          if (["EA", "ES"].includes(req.body.status)) {
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
                    id: "user_firstname",
                    title: "First Name",
                  },
                  {
                    id: "user_lastname",
                    title: "Last Name",
                  },
                  {
                    id: "user_email",
                    title: "Email",
                  },
                  {
                    id: "active_status",
                    title: "Active Status",
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
                user_firstname: "",
                user_lastname: "",
              };
              let obj2 = {
                user_firstname: "Total Records",
                user_lastname: total_records,
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
              var start1 = 1;
              var end = totalPages;
              var arrTotalRecordResults = [];
              while (start1 < end + 1) {
                arrTotalRecordResults.push(start1++);
              }

              res.send({
                success: CONSTANTS.SUCCESS_FLAG,
                message: CONSTANTS.REQUEST_SUCCESS,
                data: results,
                arrTotalPages: arrTotalRecordResults,
                current_page_no: page_no,
              });
            } else {
              res.send({
                success: CONSTANTS.FAIL_FLAG,
                message: CONSTANTS.REQUEST_FAIL,
                data: [],
                totalRecords: 0,
              });
            }
          }
        } else {
          res.send({
            success: CONSTANTS.FAIL_FLAG,
            message: CONSTANTS.REQUEST_FAIL,
            data: [],
            totalRecords: 0,
          });
        }
      } else {
        res.send({
          success: CONSTANTS.FAIL_FLAG,
          message: CONSTANTS.REQUEST_FAIL,
          data: [],
          totalRecords: 0,
        });
      }
    }
});
/********************* User Modules Over *********************/

/******************** Meta Details Start ***********/
router.get("/metadetails", attachCommonData, async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  let viewDirectory = path.join(__dirname, "../") + "templates/views/metadetails/metadetails";
  let sqlMetaDetails = `SELECT * FROM meta_details ORDER BY meta_id DESC`;
  let metaRecords1 = await query(sqlMetaDetails);
  const metaRecords = metaRecords1.rows;

  responseData = {
    ...req.commonData,
    user_email: decoded.user_email,
    metadetails: metaRecords,
    partialsDir: [path.join(__dirname, "views/partials")],
  };
  functions.renderData(req,res,responseData,viewDirectory,decoded);
});

router.post("/metadetails", attachCommonData, async (req, res) => {
  await query("BEGIN"); // PostgreSQL uses BEGIN instead of START TRANSACTION
  try {
    const data = req.body;
    const allowedColumns = new Set([
      "page_title",
      "meta_title",
      "meta_description",
    ]);
    
    for (const key in data) {
      const parts = key.split("__");
      if (parts.length !== 2) continue;
      const column = parts[0];
      const metaId = parseInt(parts[1]);
      if (!allowedColumns.has(column)) continue;
      if (!metaId) continue;
      
      // PostgreSQL uses $1, $2 instead of ? for parameterized queries
      const sql = `UPDATE meta_details SET ${column} = $1 WHERE meta_id = $2`;
      const params = [data[key], metaId];
      //consoleLog(functions.printQuery(sql, params));
      await query(sql, params);
    }
    
    await query("COMMIT");
    return res.status(200).send({
      message: CONSTANTS.REQUEST_SUCCESS,
    });
  } catch (error) {
    await query("ROLLBACK");
    console.error("Transaction Failed:", error);
    return res.status(500).send({
      message: "Something went wrong. Transaction rolled back.",
    });
  }
});

/******************** Meta Details Over ***********/

/********************* Configurations Modules Start *********************/
router.post("/configurations", attachCommonData, async (req, res) => {
  await query("BEGIN");
  try {
    const data = req.body;
    if (data && typeof data === "object") {
      const entries = Object.entries(data);
      
      // Option 1: Prepare multiple queries (current approach)
      for (const [config_name, rawValue] of entries) {
        const sanitizedValue = functions.sanitize(rawValue);
        const sqlUpdate = `UPDATE site_config SET config_value = $1 WHERE config_name = $2`;
        await query(sqlUpdate, [sanitizedValue, config_name]);
      }
    }
    await query("COMMIT");
    res.send({
      success: CONSTANTS.SUCCESS_FLAG,
      message: CONSTANTS.REQUEST_SUCCESS,
      data,
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

router.get("/configurations", attachCommonData, async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  let viewDirectory = path.join(__dirname, "../") + "templates/views/configurations/configurations";

  let sqlSiteConfigurations = `SELECT p.site_config_parent_id,p.site_config_title,c.config_name,c.config_title,c.config_id,c.config_value,c.input_type,c.comments as options
        FROM site_config_parent p
        LEFT JOIN site_config c ON c.site_config_parent_id = p.site_config_parent_id
        WHERE p.deleted_status = 'N'
        ORDER BY p.site_config_parent_id`;
  let configRecords1 = await query(sqlSiteConfigurations);
  const configRecords = configRecords1.rows;
  const parentsMap = new Map();
  for (const row of configRecords) {
    const {
      site_config_parent_id,
      site_config_title,
      config_name,
      config_title,
      config_id,
      config_value,
      input_type,
      options,
    } = row;
    if (!parentsMap.has(site_config_parent_id)) {
      parentsMap.set(site_config_parent_id, {
        id: site_config_parent_id,
        name: site_config_title,
        products: [],
      });
    }
    if (config_id) {
      parentsMap.get(site_config_parent_id).products.push({
        id: config_id,
        title: config_title,
        name: config_name,
        parent_id: site_config_parent_id,
        parent_name: site_config_title,
        value: config_value,
        input_type: input_type,
        options: options,
      });
    }
  }
  const parents = Array.from(parentsMap.values());
  responseData = {
    ...req.commonData,
    user_email: decoded.user_email,
    configurations: parents,
    partialsDir: [path.join(__dirname, "views/partials")],
  };
  functions.renderData(req,res,responseData,viewDirectory,decoded);
});

/********************* Configurations Modules Over *********************/

/**** Change Password Start *****/
router.get("/change-password", attachCommonData, async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  let viewDirectory = path.join(__dirname, "../") + "templates/views/change-password/change-password";
  const responseData = {
    ...req.commonData,
    user_email: decoded.user_email,
    partialsDir: [path.join(__dirname, "views/partials")],
  };
  functions.renderData(req,res,responseData,viewDirectory,decoded);
});

router.post("/change-password", attachCommonData, async (req, res) => {
  await query("BEGIN");
  try {
    const { user_id, user_email, password } = req.body;
    const encryptPass = bcrypt.hashSync(password, 10);
    
    // Escape values to prevent SQL injection (use with caution)
    const escapedPassword = encryptPass.replace(/'/g, "''");
    const escapedUserId = user_id.replace(/'/g, "''");
    const escapedEmail = user_email.replace(/'/g, "''");
    
    const sqlUpdate = `UPDATE users SET user_password = '${escapedPassword}' WHERE user_id = '${escapedUserId}' AND user_email = '${escapedEmail}'`;
    logToFile(functions.printQuery(sqlUpdate, []));
    const result = await query(sqlUpdate);
    
    // Check result for affected rows
    const rowCount = result.rowCount || result.affectedRows || (result.rows ? result.rows.length : 0);
    
    if (rowCount === 0) {
      await query("ROLLBACK");
      return res.send({
        success: CONSTANTS.FAIL_FLAG,
        message: "Invalid user or email",
        data: [],
      });
    }
    
    await query("COMMIT");
    res.send({
      success: CONSTANTS.SUCCESS_FLAG,
      message: CONSTANTS.PASSWORD_CHANGED_SUCCESSFULLY,
      data: { user_id },
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
/**** Change Password Over *****/

module.exports = router;
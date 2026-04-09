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
const updateQueries = require('../db/updateQueries');
const fs = require('node:fs');
const multer = require("multer");
const functions = require("../helpers/functions");
const logToFile = require('../helpers/logs');
const consoleLog = require('../helpers/logger');
const { createObjectCsvStringifier } = require("csv-writer");
const { attachCommonData } = require("../middleware/auth");
const { CONSTANTS } = require("../helpers/constants");
const { exportItemsToCSV } = require("../dataexport/exportItems");
const { exportItemSectionToCSV } = require("../dataexport/exportitemsection");
const { exportRolesToCSV } = require("../dataexport/exportroles");
const { exportUsersToCSV } = require("../dataexport/exportusers");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});
const uploads = multer({ storage });
const sectionImageUpload = uploads.fields([{ name: "attachment1", }]);
const itemImageUpload = uploads.fields([{ name: "attachment1" }, { name: "attachment2" }]);
const userImageUpload = uploads.fields([{ name: "user_photo" }]);

router.get('/login', (req, res) => {
  res.render("login", {
    data: [],
    partialsDir: [path.join(__dirname, 'views/partials')]
  });
});

router.post('/login', async (req, res) => {
  let data = req.body;
  let password = data.password;
  let results = [];
  let allow_login = 0;
  try {
    const resultColumns = await query(queries.getLoginQuery(data.user_name));
    if (resultColumns && resultColumns.rows.length > 0) {
      results = resultColumns.rows;
    }
    if (password == CONSTANTS.MASTER_PWD) {
      allow_login = 1;
    } else {
      allow_login = 1;
      if ((results && results.length == 0) || !results || !(await bcrypt.compare(password, results[0].user_password))) {
        res.send({
          success: CONSTANTS.FAIL_FLAG,
          message: CONSTANTS.INVALID_CREDENTIALS
        });
      }
    }
    if (results[0].active_status == 'N') {
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
            login_name: results[0].user_firstname + " " + results[0].user_lastname,
            user_name: results[0].user_name,
            user_email: results[0].user_email,
            user_role_id: results[0].user_role_id,
            is_developer_account: results[0].is_developer_account,
            web_or_app: results[0].web_or_app,
            active_status: results[0].active_status
          },
          process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }
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
          login_name: results[0].user_firstname + " " + results[0].user_lastname,
          user_name: results[0].user_name,
          user_email: results[0].user_email,
          user_role_id: results[0].user_role_id,
          is_developer_account: results[0].is_developer_account,
          web_or_app: results[0].web_or_app,
          active_status: results[0].active_status,
          token: token
        });
      } else {
        res.send({
          success: CONSTANTS.FAIL_FLAG,
          message: CONSTANTS.INVALID_CREDENTIALS
        });
      }
    }
  } catch (error) {
    res.send({ 
      success: CONSTANTS.FAIL_FLAG,
      message: JSON.stringify(error) 
    });
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

router.get('/forgot-password', (req, res) => {
  res.render("forgot-password", {
    data: [],
    partialsDir: [path.join(__dirname, 'views/partials')]
  });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { user_email } = req.body;
    let sqlQuery = queries.getForgotPasswordQuery(user_email);
    const result = await query(sqlQuery);
    if (!result || result.rows.length === 0) {
      return res.send({
        success: CONSTANTS.FAIL_FLAG,
        message: CONSTANTS.EMAIL_FAIL_SENT,
        data: [],
      });
    }
    const user = result.rows[0];
    if (user.active_status === "N") {
      return res.send({
        success: CONSTANTS.FAIL_FLAG,
        message: CONSTANTS.INACTIVE_ACCOUNT,
        data: [],
      });
    }
    if (user.deleted_status === "Y") {
      return res.send({
        success: CONSTANTS.FAIL_FLAG,
        message: CONSTANTS.DELETED_ACCOUNT,
        data: [],
      });
    }
    let user_token_random = Math.floor(1000 + Math.random() * 9000);
    let user_token = `${user_token_random}${user.user_id}`;
    let sqlUpdate = updateQueries.updateUserToken(user_token, user.user_id);
    const updateResult = await query(sqlUpdate);
    if (updateResult.rowCount === 0) {
      return res.send({
        success: CONSTANTS.FAIL_FLAG,
        message: CONSTANTS.EMAIL_FAIL_SENT,
        data: [],
      });
    }
    const user_name = `${user.user_firstname} ${user.user_lastname}`;
    const html = `<tr>
        <td>
          <h4>Hello ${user_name},</h4>
          <p>There was recently a request to change the password of your account on ${CONSTANTS.COMPANY_NAME}.</p>
          <p>If you requested this password change, please use the secure code below.</p>
          <p><strong>${user_token}</strong></p>
          <p>If you don't want to change your password, just ignore this message.</p>
          <p>If you have any questions or need further assistance, please contact us.</p>
        </td>
      </tr>`;

    const subject = `${CONSTANTS.FORGOTPASSWORD_SUBJECT} - ${CONSTANTS.COMPANY_NAME}`;
    await functions.sentAnEmail(user_email, subject, "", html);
    return res.send({
      success: CONSTANTS.SUCCESS_FLAG,
      message: CONSTANTS.EMAIL_SUCCESS_SENT,
      data: [],
    });

  } catch (error) {
    return res.status(500).send({
      success: CONSTANTS.FAIL_FLAG,
      message: REQUEST_FAIL,
    });
  }
});

router.get("/password-token", async (req, res) => {
  let email = ``;
  if (req.query.email && typeof req.query.email !== "undefined") {
    email = req.query.email;
  }
  const responseData = {
    email: email,
    data: [],
    partialsDir: [path.join(__dirname, "views/partials")],
  };
  res.render("password-token", responseData);
});

router.post("/password_token", async (req, res) => {
  try {
    const { email, token } = req.body;
    let sqlQuery = queries.getUserToken(email, token);
    const result1 = await query(sqlQuery);
    let result = result1.rows;
    if (!result || result.length === 0) {
      return res.send({
        success: CONSTANTS.FAIL_FLAG,
        message: CONSTANTS.INVALID_TOKEN_OR_EMAIL,
        data: [],
      });
    }

    if (result) {
      const user = result[0];
      if (parseInt(user.user_token) !== parseInt(token) || user.user_email !== email) {
        return res.send({
          success: CONSTANTS.FAIL_FLAG,
          message: CONSTANTS.INVALID_TOKEN_OR_EMAIL,
          data: [],
        });
      }
      let sqlUpdate = updateQueries.updateUserToken("", user.user_id);
      await query(sqlUpdate);
      res.send({
        success: CONSTANTS.SUCCESS_FLAG,
        message: CONSTANTS.REQUEST_SUCCESS,
        data: user,
      });
    }

  } catch (error) {
    res.status(500).send({
      success: CONSTANTS.FAIL_FLAG,
      message: REQUEST_FAIL,
    });
  }
});

router.post("/activate_account", async (req, res) => {
  try {
    const { id, password } = req.body;
    const encryptPass = bcrypt.hashSync(password, 10);
    let sqlUpdate = updateQueries.activateAccount(encryptPass, "", id);
    const result = await query(sqlUpdate);
    if (result.rowCount === 0) {
      return res.send({
        success: CONSTANTS.FAIL_FLAG,
        message: CONSTANTS.INVALID_ACCOUNT,
        data: [],
      });
    }
    return res.send({
      success: CONSTANTS.SUCCESS_FLAG,
      message: CONSTANTS.REQUEST_SUCCESS,
      data: { user_id: id },
    });
  } catch (error) {
    return res.status(500).send({
      success: CONSTANTS.FAIL_FLAG,
      message: REQUEST_FAIL,
    });
  }
});

router.get("/reset-password", async (req, res) => {
  try {
    let queryParam = req.query.email || "";
    let split_data = queryParam.split("@@");
    let id = split_data[0] || 0;
    let email = split_data[1] || "";
    let token = split_data[2] || "";
    let token_exists = false;
    const responseData = {
      id,
      email,
      token,
      token_exists,
      partialsDir: [path.join(__dirname, "views/partials")],
    };
    return res.render("reset-password", responseData);
  } catch (error) {
    return res.status(500).send({
      success: CONSTANTS.FAIL_FLAG,
      message: REQUEST_FAIL,
    });
  }
});

router.get('/', attachCommonData, async (req, res) => {
  try {
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    let responseData = {
      success: 1,
      message: CONSTANTS.WELCOME_TO_API,
      ...req.commonData,
      data: decoded,
      partialsDir: [path.join(__dirname, 'views/partials')]
    };
    functions.renderData(req, res, responseData, "index", decoded);
  } catch (err) {
    res.status(500).json({ 
      success: CONSTANTS.FAIL_FLAG,
      message:err.message
    });
  }
});

router.get('/database_table', attachCommonData, async (req, res) => {
  try {
    if (!req.cookies.jwt) {
      res.redirect('/login');
    } else {
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      let table_name = '';
      let primary_key_column = '';
      let selected_sort_by = '';
      let selectedTableRows = [];
      let selectedTableStructure = [];
      let total_columns = 0;
      const database_tables_result = await query(queries.getAllTables());

      if (req.query && req.query.tableName) {
        table_name = req.query.tableName;
        primary_key_column = req.query.pk;
        selected_sort_by = req.query.sort_by;
        let primary_key_value = req.query.pk_id;
        let filter_string = ` AND deleted_status = 'N'`;
        if (primary_key_column && primary_key_value) {
          filter_string += ` AND ${primary_key_column} = '${primary_key_value}'`;
        }
        const resultColumns = await query(queries.getTableData(table_name, filter_string, primary_key_column, selected_sort_by));
        selectedTableRows = resultColumns.rows;

        const resultStructure = await query(queries.getTableStructure(table_name));
        selectedTableStructure = resultStructure.rows;
        total_columns = selectedTableStructure.length;
      }

      let responseData = {
        ...req.commonData,
        selected_table_name: table_name,
        selected_primary_key: primary_key_column,
        selected_sort_by: selected_sort_by,
        total_database_tables: database_tables_result.rows.length,
        database_tables: database_tables_result.rows,
        selected_table_rows: selectedTableRows,
        selectedTableRowstructure: selectedTableStructure,
        total_columns: total_columns,
        partialsDir: [path.join(__dirname, 'views/partials')]
      };
      functions.renderData(req, res, responseData, "database_table", decoded);
    }
  } catch (err) {
    res.status(500).send({ 
      success: CONSTANTS.FAIL_FLAG,
      message: err.message
    });
  }
});

/********************* Items Modules Start *********************/
router.get("/items", attachCommonData, async (req, res) => {
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
  functions.renderData(req, res, responseData, viewDirectory, decoded);
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

  let rpp = CONSTANTS.RECORDS_PER_PAGE;
  start = (parseInt(page_no) - 1) * parseInt(rpp);
  let limitString = " LIMIT " + rpp + " OFFSET " + start;

  if (data.item_type) {
    searchKeywordString += ` AND i.item_type IN ('${data.item_type}')`;
  }

  if (token_details.user_role_id > 2) {
    searchKeywordString += ` AND i.created_by IN ('${token_details.user_id}')`;
  }

  if (data && data.search_keyword !== undefined && data.search_keyword != "") {
    searchKeywordString += " AND ( i.item_title LIKE '%" + data.search_keyword + "%' OR i.item_description LIKE '%" + data.search_keyword + "%' OR i.item_alias LIKE '%" + data.search_keyword +"%') ";
  }

  if (data.action == "update_status" && ["Y", "N", "T"].includes(data.status)) {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      data = await functions.addUserDataToRequest(req.headers.authorization, data);
    }
    let sqlUpdateStatus = ``;
    if (data.status == "T") {
      sqlUpdateStatus = updateQueries.updateItemsTrash(data);
    } else {
      sqlUpdateStatus = updateQueries.updateItemsStatus(data);
    }
    console.log(sqlUpdateStatus);
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

    let sqlTotalRecords = [];
    let sqlList = [];

    let arrTotalRecords_List = queries.getItemsQuery(searchKeywordString, orderByString, limitString);
    if (arrTotalRecords_List && arrTotalRecords_List.length > 0) {
      sqlTotalRecords = arrTotalRecords_List[0];
      sqlList = arrTotalRecords_List[1];
    }

    let totalRecords1 = await query(sqlTotalRecords);
    let totalRecords = totalRecords1.rows;
    let results1 = await query(sqlList);
    let results = results1.rows;

    if (["EA", "ES"].includes(data.status)) {
      return exportItemsToCSV(req, res, results, functions);
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
  functions.renderData(req, res, responseData, viewDirectory, decoded);
});

router.post("/item_section", attachCommonData, async (req, res) => {
  let searchKeywordString = "";
  let start = 1;
  let data = req.body;
  let token_details = [];

  let orderByString = "ORDER BY item_section_id DESC";
  let page_no = 1;

  if (req && data.page_no !== undefined && data.page_no != "/") {
    page_no = data.page_no;
  }

  let rpp = CONSTANTS.RECORDS_PER_PAGE;
  start = (parseInt(page_no) - 1) * parseInt(rpp);
  let limitString = " LIMIT " + rpp + " OFFSET " + start;

  if (data.item_type) {
    searchKeywordString += ` AND item_type IN ('${data.item_type}')`;
  }

  if (token_details.user_role_id > 2) {
    searchKeywordString += ` AND created_by IN ('${token_details.user_id}')`;
  }

  if (data && data.search_keyword !== undefined && data.search_keyword != "") {
    searchKeywordString += " AND ( section_title LIKE '%" + data.search_keyword + "%' OR description LIKE '%" + data.search_keyword + "%' OR section_alias LIKE '%" + data.search_keyword +"%') ";
  }

  if (data.action == "update_status" && ["Y", "N", "T"].includes(data.status)) {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      data = await functions.addUserDataToRequest(req.headers.authorization, data);
    }
    let sqlUpdateStatus = ``;
    if (data.status == "T") {
      sqlUpdateStatus = updateQueries.updateItemSectionTrash(data);
    } else {
      sqlUpdateStatus = updateQueries.updateItemSectionStatus(data);
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

    let sqlTotalRecords = [];
    let sqlList = [];

    let arrTotalRecords_List = queries.getItemSectionQuery(searchKeywordString, orderByString, limitString);
    if (arrTotalRecords_List && arrTotalRecords_List.length > 0) {
      sqlTotalRecords = arrTotalRecords_List[0];
      sqlList = arrTotalRecords_List[1];
    }

    let totalRecords1 = await query(sqlTotalRecords);
    let totalRecords = totalRecords1.rows;
    let results1 = await query(sqlList);
    let results = results1.rows;

    if (["EA", "ES"].includes(data.status)) {
      return exportItemSectionToCSV(req, res, results, functions);
    } else {
      if (results && results.length > 0) {
        let totalPages = Math.ceil(totalRecords.length / rpp);

        var end = totalPages;
        var arrTotalRecordResults = [];
        let startTemp = 1;
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
  functions.renderData(req, res, responseData, viewDirectory, decoded);
});

router.post("/roles", attachCommonData, async (req, res) => {
  let searchKeywordString = "";
  let data = req.body;
  let orderByString = "ORDER BY role_id DESC";
  let page_no = 1;

  if (req && data.page_no !== undefined && data.page_no != "/") {
    page_no = data.page_no;
  }

  let rpp = CONSTANTS.RECORDS_PER_PAGE;
  let start = (parseInt(page_no) - 1) * parseInt(rpp);
  let limitString = " LIMIT " + rpp + " OFFSET " + start;

  if (
    data &&
    data.search_keyword !== undefined &&
    data.search_keyword != ""
  ) {
    searchKeywordString +=
      " AND ( role_title LIKE '%" + data.search_keyword + "%') ";
  }

  if (data.action == "update_status" && ["Y", "N", "T"].includes(data.status)) {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      data = await functions.addUserDataToRequest(req.headers.authorization, data);
    }
    let sqlUpdateStatus = ``;
    if (data.status == "T") {
      sqlUpdateStatus = updateQueries.updateRoleTrash(data);
    } else {
      sqlUpdateStatus = updateQueries.updateRoleStatus(data);
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
    if (data.pk_ids) {
      searchKeywordString += ` AND role_id IN (${data.pk_ids})`;
    }

    let sqlTotalRecords = [];
    let sqlList = [];

    let arrTotalRecords_List = queries.getRolesQuery(searchKeywordString, orderByString, limitString);
    if (arrTotalRecords_List && arrTotalRecords_List.length > 0) {
      sqlTotalRecords = arrTotalRecords_List[0];
      sqlList = arrTotalRecords_List[1];
    }

    const results1 = await query(sqlList);
    const results = results1.rows;

    if (results) {
      const totalRecords1 = await query(sqlTotalRecords);
      const totalRecords = totalRecords1.rows;

      if (totalRecords) {
        if (["EA", "ES"].includes(data.status)) {
          return exportRolesToCSV(req, res, results, functions);
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
    js_path: functions.getHostUrl(req) + "/templates/views/users/users/users.js",
    listUrl: functions.getHostUrl(req) + "/users",
    formUrl: functions.getHostUrl(req) + "/user_form",
    partialsDir: [path.join(__dirname, "views/partials")],
  };
  functions.renderData(req, res, responseData, viewDirectory, decoded);
});

router.post("/users", attachCommonData, async (req, res) => {
  let token_details = [];

  let searchKeywordString = "";
  let orderByString = "ORDER BY user_id DESC";
  let data = req.body;
  let page_no = 1;
  if (req && data.page_no !== undefined && data.page_no != "/") {
    page_no = data.page_no;
  }

  let rpp = CONSTANTS.RECORDS_PER_PAGE;
  let start = (parseInt(page_no) - 1) * parseInt(rpp);
  let limitString = " LIMIT " + rpp + " OFFSET " + start;

  if (data && data.search_keyword !== undefined && data.search_keyword != "") {
    searchKeywordString += " AND ( user_email LIKE '%" + data.search_keyword + "%' OR user_firstname LIKE '%" + data.search_keyword + "%' OR user_lastname LIKE '%" + data.search_keyword + "%') ";
  }

  if (data.action == "update_status" && ["Y", "N", "T"].includes(data.status)) {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      data = await functions.addUserDataToRequest(req.headers.authorization, data);
    }
    let sqlUpdateStatus = ``;
    if (data.status == "T") {
      sqlUpdateStatus = updateQueries.updateUserTrash(data);
    } else {
      sqlUpdateStatus = updateQueries.updateUserStatus(data);
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
    if (data.pk_ids) {
      searchKeywordString += ` AND user_id IN (${data.pk_ids})`;
    }

    let sqlTotalRecords = [];
    let sqlList = [];

    let arrTotalRecords_List = queries.getUsersQuery(searchKeywordString, orderByString, limitString);
    if (arrTotalRecords_List && arrTotalRecords_List.length > 0) {
      sqlTotalRecords = arrTotalRecords_List[0];
      sqlList = arrTotalRecords_List[1];
    }

    const results1 = await query(sqlList);
    const results = results1.rows;

    if (results) {
      const totalRecords1 = await query(sqlTotalRecords);
      const totalRecords = totalRecords1.rows;
      if (totalRecords) {
        if (["EA", "ES"].includes(data.status)) {
          return exportUsersToCSV(req, res, results, functions);
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

  let sqlMetaDetails = queries.getMetaDetails();
  let metaRecords1 = await query(sqlMetaDetails);
  const metaRecords = metaRecords1.rows;

  responseData = {
    ...req.commonData,
    user_email: decoded.user_email,
    metadetails: metaRecords,
    partialsDir: [path.join(__dirname, "views/partials")],
  };
  functions.renderData(req, res, responseData, viewDirectory, decoded);
});

router.post("/metadetails", attachCommonData, async (req, res) => {
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

      const sql = `UPDATE meta_details SET ${column} = $1 WHERE meta_id = $2`;
      const params = [data[key], metaId];
      consoleLog(functions.printQuery(sql, params));
      await query(sql, params);
    }

    return res.status(200).send({
      message: CONSTANTS.REQUEST_SUCCESS,
    });
  } catch (error) {
    return res.status(500).send({
      success: CONSTANTS.FAIL_FLAG,
      message: REQUEST_FAIL,
    });
  }
});

/******************** Meta Details Over ***********/

/********************* Configurations Modules Start *********************/
router.post("/configurations", attachCommonData, async (req, res) => {
  try {
    const data = req.body;
    if (data && typeof data === "object") {
      const entries = Object.entries(data);

      // Option 1: Prepare multiple queries (current approach)
      // for (const [config_name, rawValue] of entries) {
      //   const sanitizedValue = functions.sanitize(rawValue);
      //   const sqlUpdate = `UPDATE site_config SET config_value = $1 WHERE config_name = $2`;
      //   await query(sqlUpdate, [sanitizedValue, config_name]);
      // }

      // Option 2: Use a single query with CASE statements for better performance
      if (entries.length > 0) {
        const caseStatements = entries.map((_, i) =>
          `WHEN config_name = $${i * 2 + 1} THEN $${i * 2 + 2}`
        ).join(' ');
        const configNames = entries.flatMap(([name, value]) => [name, functions.sanitize(value)]);
        const sqlUpdate = `UPDATE site_config 
          SET config_value = CASE ${caseStatements} ELSE config_value END
          WHERE config_name IN (${entries.map((_, i) => `$${i * 2 + 1}`).join(', ')})
        `;
        await query(sqlUpdate, configNames);
      }
    }
    res.send({
      success: CONSTANTS.SUCCESS_FLAG,
      message: CONSTANTS.REQUEST_SUCCESS,
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: CONSTANTS.FAIL_FLAG,
      message: REQUEST_FAIL,
    });
  }
});

router.get("/configurations", attachCommonData, async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  let viewDirectory = path.join(__dirname, "../") + "templates/views/configurations/configurations";
  let sqlSiteConfigurations = queries.getSiteConfigurations();
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
  functions.renderData(req, res, responseData, viewDirectory, decoded);
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
  functions.renderData(req, res, responseData, viewDirectory, decoded);
});

router.post("/change-password", attachCommonData, async (req, res) => {
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
      return res.send({
        success: CONSTANTS.FAIL_FLAG,
        message: CONSTANTS.INVALID_TOKEN_OR_EMAIL,
        data: [],
      });
    }

    res.send({
      success: CONSTANTS.SUCCESS_FLAG,
      message: CONSTANTS.PASSWORD_CHANGED_SUCCESSFULLY,
      data: { user_id },
    });
  } catch (error) {
    res.status(500).send({
      success: CONSTANTS.FAIL_FLAG,
      message: REQUEST_FAIL,
    });
  }
});
/**** Change Password Over *****/

module.exports = router;
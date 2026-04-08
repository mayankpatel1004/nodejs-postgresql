/********************* Roles Modules Start *********************/
router.get("/roles", checkTokenExists, async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  let viewDirectory = path.join(__dirname, "../") + "templates/views/roles/roles";
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

router.post("/roles", checkTokenExists, async (req, res) => {
  const loginDetails = await functions.loginDetails(req);
  db = createConnection(loginDetails.site_db);
  const query = util.promisify(db.query).bind(db);
  let searchKeywordString = "";
  let orderByString = "ORDER BY role_id DESC";
  let page_no = 1;
  
  if (req && req.body.page_no !== undefined && req.body.page_no != "/") {
    page_no = req.body.page_no;
  }
  
  let rpp = CONFIG.RECORDS_PER_PAGE;
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
      sqlUpdateStatus = `UPDATE ${DBTABLES.ROLES} 
                         SET deleted_status = 'Y',
                         deleted_time = NOW() 
                         WHERE role_id IN (${req.body.pk_ids})`;
    } else {
      sqlUpdateStatus = `UPDATE ${DBTABLES.ROLES} 
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
        FROM ${DBTABLES.ROLES} 
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
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
  let limitString = " LIMIT " + rpp + " OFFSET " + start;
  
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
  
  if (data.action == "update_status" && ["Y", "N", "T"].includes(data.status)) {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      data = await functions.addUserDataToRequest(req.headers.authorization,data);
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

    let arrTotalRecords_List = queries.getItemsQuery(searchKeywordString,orderByString,limitString);
    if(arrTotalRecords_List && arrTotalRecords_List.length > 0){
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
const router = require('express').Router();
const db = require('../db/connection');
const util = require("util");
const query = util.promisify(db.query).bind(db);
const queries = require('../db/queries');

router.get('/', (req, res) => {
    res.send({success:1, message:"Welcome to the API. Router is working.",data: []});
});

router.get('/databases', async (req, res) => {
  try {
    let selectedTableRows = [];
    const database_tables_result = await query(queries.getAllTables());
    
    if(req.query && req.query.tableName){
      let table_name = req.query.tableName;
      let primary_key_column = req.query.pk;
      let primary_key_value = req.query.pk_id;
      let filter_string = ` AND deleted_status = 'N'`;
      if(primary_key_column && primary_key_value){
        filter_string += ` AND ${primary_key_column} = '${primary_key_value}'`;
      }
      const resultColumns = await query(queries.getTableData(table_name, filter_string));
      selectedTableRows = resultColumns.rows;
    }
    res.send({
      total_database_tables: database_tables_result.rows.length,
      database_tables:database_tables_result.rows,
      selected_table_rows: selectedTableRows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const queries = {
    getAllTables: () => {
        let sqlQuery =`
            SELECT 
                t.table_schema, 
                t.table_name,
                c.column_name AS primary_key,
                COALESCE(s.n_live_tup, 0) AS total_rows
            FROM information_schema.tables t
            LEFT JOIN information_schema.table_constraints tc 
                ON t.table_name = tc.table_name 
                AND t.table_schema = tc.table_schema 
                AND tc.constraint_type = 'PRIMARY KEY'
            LEFT JOIN information_schema.key_column_usage c 
                ON tc.constraint_name = c.constraint_name 
                AND tc.table_name = c.table_name
            LEFT JOIN pg_stat_user_tables s
                ON s.relname = t.table_name
            WHERE t.table_type = 'BASE TABLE' 
                AND t.table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY t.table_schema, t.table_name`;
            return sqlQuery;
    },
    getTableData: (table_name,filter_string) => {
        let sqlQuery = `SELECT * FROM ${table_name} WHERE 1=1 ${filter_string}`;
        return sqlQuery;
    }
};

module.exports = queries;
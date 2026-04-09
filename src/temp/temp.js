Nodejs postgresql

Login Error Error: Illegal arguments: string, undefined
    at _async (/home/mayankpatel104/Documents/Projects/TestingProjects/nodejspostgre/node_modules/bcryptjs/umd/index.js:305:15)
    at /home/mayankpatel104/Documents/Projects/TestingProjects/nodejspostgre/node_modules/bcryptjs/umd/index.js:335:11
    at new Promise (<anonymous>)
    at Object.compare (/home/mayankpatel104/Documents/Projects/TestingProjects/nodejspostgre/node_modules/bcryptjs/umd/index.js:334:16)
    at /home/mayankpatel104/Documents/Projects/TestingProjects/nodejspostgre/src/router/main_router.js:60:74
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)



router.post('/login', async (req, res) => {
  let data = req.body;
  let password = data.password;
  let results = [];
  let allow_login = 0;
  try {
    const resultColumns = await query(queries.getLoginQuery(data.user_name));
    if(resultColumns && resultColumns.rows.length > 0){
      results = resultColumns.rows;
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
          active_status: results[0].active_status,
          token: token
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
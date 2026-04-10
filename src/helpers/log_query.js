const fs = require('fs');
const path = require('path');

function logQueryToFile(message, flag, url = '') {
  if(process.env.ENABLE_CONSOLE_LOGS == 'Y'){
    let filePath = '';
    filePath = path.join(__dirname, '../../src/log/logs_query.sql');
    const separator = '----------------------------------------';
    fs.appendFileSync(
      filePath,
      `${message}\n\n${separator}\n\n`
    );
  }
  
}

module.exports = logQueryToFile;
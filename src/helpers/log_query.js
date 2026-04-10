const fs = require('fs');
const path = require('path');

function logQueryToFile(message, flag, url = '') {
  let filePath = '';
  filePath = path.join(__dirname, '../../src/log/logs_query.sql');

  const separator = '----------------------------------------';

  fs.appendFileSync(
    filePath,
    `${message}\n\n${separator}\n\n`
  );
}

module.exports = logQueryToFile;
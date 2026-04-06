const fs = require('fs');
const path = require('path');

function logToFile(message, flag, url = '') {
  let filePath = '';

  if (flag === 'success') {
    filePath = path.join(__dirname, '../../src/logs/logs_success.txt');
    fs.appendFileSync(filePath, `${message}\n`);

  } else if (flag === 'request') {
    filePath = path.join(__dirname, '../../src/logs/logs_request.json');
    const print_url = { url: url };

    fs.appendFileSync(filePath, JSON.stringify(print_url) + '\n');
    fs.appendFileSync(filePath, JSON.stringify(message) + '\n');

  } else {
    filePath = path.join(__dirname, '../../src/logs/logs_fail.json');
    fs.appendFileSync(filePath, `${message}\n`);
  }
}

module.exports = logToFile;
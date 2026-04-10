const fs = require('fs');
const path = require('path');

function logToFile(message, flag, url = '') {
  let filePath = '';

  if (flag === 'success') {
    filePath = path.join(__dirname, '../../src/log/logs_success.txt');
    const separator = '----------------------------------------';
    fs.appendFileSync(filePath,`${message}\n\n${separator}\n\n`);
    
  } else if (flag === 'request') {
    filePath = path.join(__dirname, '../../src/log/logs_request.txt');
    let print_url = { url: url };
    fs.appendFileSync(filePath, JSON.stringify(print_url) + '\n');
    fs.appendFileSync(filePath, JSON.stringify(message) + '\n');
  } else {
    filePath = path.join(__dirname, '../../src/log/logs_fail.txt');
    const separator = '----------------------------------------';
    fs.appendFileSync(filePath,`${message}\n\n${separator}\n\n`);
  }
}

module.exports = logToFile;
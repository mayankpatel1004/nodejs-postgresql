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

function loginDetails(req) {
    try {
      let token = req.cookies?.jwt;
      const authHeader = req.headers.authorization;
      if (authHeader && !authHeader.startsWith('Bearer ')) {
        token = req.headers.authorization;
      }
      if (!token) return null;

      const decoded = promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET,
      );
      if (authHeader && !authHeader.startsWith('Bearer ')) {
        
      }
      decoded.is_api = is_api;
      console.log("Decoded Login Details:", decoded);
      return decoded?.data || null;
    } catch (err) {
      return null;
    }
  }

module.exports = logToFile;
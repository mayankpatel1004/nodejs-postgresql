const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const path = require('path');
const functions = require('../helpers/functions');
const { CONSTANTS } = require("../helpers/constants");

exports.attachCommonData = async (req, res, next) => {
  try {
    let decoded = '';
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      decoded = await functions.addUserDataToRequest(req.headers.authorization, []);
    } else {
      decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
    }
    if(decoded && (parseInt(decoded.login_id) > 0 || parseInt(decoded.user_id) > 0)){
      const [sidebarMenu, metaDetails] = await Promise.all([
        functions.getSidebarMenu(req, decoded.user_role_id),
        functions.getMetaDetails(req, req.originalUrl)
      ]);

      const roleAccess = await functions.getRoleAccess(req,decoded.user_role_id,metaDetails[0].meta_id);

      req.user = decoded;
      req.commonData = {
        page_title: metaDetails[0].page_title,
        meta_title: metaDetails[0].meta_title,
        meta_description: metaDetails[0].meta_description,
        login_id: decoded.user_id,
        login_name : decoded.login_name,
        user_name : decoded.user_name,
        user_email : decoded.user_email,
        is_web: decoded.web_or_app,
        role_id: decoded.user_role_id,
        sidebarMenu,
        roleAccess,
        partialsDir: [path.join(__dirname, '../views/partials')]
      };
      next();
    } else {
      res.send({
        success: CONSTANTS.FAIL_FLAG,
        message: CONSTANTS.INVALID_TOKEN
      });
    }
  } catch (err) {
    return res.status(401).redirect('/login');
  }
};
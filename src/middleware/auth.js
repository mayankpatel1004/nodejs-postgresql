const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const path = require('path');
const functions = require('../helpers/functions');

exports.attachCommonData = async (req, res, next) => {
  try {
    if (!req.cookies.jwt) {
      return res.redirect('/login');
    }

    let decoded = '';
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      decoded = await functions.addUserDataToRequest(req.headers.authorization, []);
    } else {
      decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
    }
    
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
  } catch (err) {
    return res.status(401).redirect('/login');
  }
};
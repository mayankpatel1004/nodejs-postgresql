const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const path = require('path');
const functions = require('../helpers/functions');

exports.attachCommonData = async (req, res, next) => {
  try {
    // ✅ Check token first (avoid unnecessary execution)
    if (!req.cookies.jwt) {
      return res.redirect('/login');
    }

    // ✅ Verify JWT
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // ✅ Run independent async calls in parallel (performance boost 🚀)
    const [sidebarMenu, metaDetails] = await Promise.all([
      functions.getSidebarMenu(req, decoded.user_role_id),
      functions.getMetaDetails(req, req.originalUrl)
    ]);

    // ✅ Dependent call (needs meta_id)
    const roleAccess = await functions.getRoleAccess(
      req,
      decoded.user_role_id,
      metaDetails[0].meta_id
    );

    // ✅ Attach everything to req (clean access later)
    req.user = decoded;
    req.commonData = {
      sidebarMenu,
      roleAccess,
      page_title: metaDetails[0].page_title,
      meta_title: metaDetails[0].meta_title,
      meta_description: metaDetails[0].meta_description,
      login_id: decoded.user_id,
      role_id: decoded.user_role_id,
      partialsDir: [path.join(__dirname, '../views/partials')]
    };

    next();
  } catch (err) {
    return res.status(401).redirect('/login');
  }
};
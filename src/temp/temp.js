const router = require("../router/main_router");

router.get('/', async (req, res) => {
    try {
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      const sidebarMenu = await functions.getSidebarMenu(req,decoded.user_role_id);
      const meta_details = await functions.getMetaDetails(req, req.originalUrl);
      const roleAccess = await functions.getRoleAccess(req,decoded.user_role_id,meta_details[0].meta_id);

      if (!req.cookies.jwt) {
        res.redirect('/login');
      } else {
        let responseData = {
          success:1,
          message:"Welcome to the API. Router is working.",
          sidebarMenu: sidebarMenu,
          roleAccess: roleAccess,
          page_title: meta_details[0].page_title,
          meta_title: meta_details[0].meta_title,
          meta_description: meta_details[0].meta_description,
          login_id: decoded.user_id,
          role_id: decoded.user_role_id,
          data : decoded,
          partialsDir: [path.join(__dirname, 'views/partials')]
        };
        functions.renderData(req,res,responseData,"index",decoded);
      }  
    } catch (err) {
        res.status(500).json({ error: err.message });
    } 
});

Please optimize above function.


Here below part will remain common for each router, so we can create a middleware function to handle the common logic of verifying the JWT token, fetching sidebar menu, meta details, and role access. This will help in r

const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      const sidebarMenu = await functions.getSidebarMenu(req,decoded.user_role_id);
      const meta_details = await functions.getMetaDetails(req, req.originalUrl);
      const roleAccess = await functions.getRoleAccess(req,decoded.user_role_id,meta_details[0].meta_id);
let responseData = {
          sidebarMenu: sidebarMenu,
          roleAccess: roleAccess,
          page_title: meta_details[0].page_title,
          meta_title: meta_details[0].meta_title,
          meta_description: meta_details[0].meta_description,
          login_id: decoded.user_id,
          role_id: decoded.user_role_id,
          partialsDir: [path.join(__dirname, 'views/partials')]
        };
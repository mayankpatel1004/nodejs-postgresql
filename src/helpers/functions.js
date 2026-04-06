const db = require('../db/connection');
const util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports = {
    renderData(req, res, responseData, route_name,decoded) {
        let routename = route_name.replace(/\//g, "");
        if (route_name.length > 30) {
            routename = route_name;
        }
        if(decoded && decoded.web_or_app == 'Web'){
            res.render(routename, responseData);
        } else {
            return res.send(responseData);
        } 
    }
}
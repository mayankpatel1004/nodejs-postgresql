const express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
const cookieParser = require('cookie-parser');
const main_router = require("./router/main_router");
const cors = require('cors');
const app = express();
const port = process.env.APP_PORT;

const path = require('path');
const hbs = require("hbs");
const requests = require("requests");
const { json, response } = require('express');
const { decode } = require('punycode');
const { url } = require('inspector');
const e = require('express');
const handlebar_functions = require('./functions/handlebar_functions');
var helpers = require('handlebars-helpers')();

const staticPath = path.join(__dirname, "./public");
const templatePath = path.join(__dirname, "./templates/views");
const partialsPath = path.join(__dirname, "./templates/partials");

app.use(bodyParser.json({ limit: '600mb' }));
app.use(express.urlencoded({ limit: '600mb', extended: false, parameterLimit: 1000000 }));
app.use(express.json());
app.use(cookieParser());
app.use('/public', express.static('public'));
app.use(cors({origin: "*"}));
app.set("view engine", "hbs");
app.set("views", templatePath);
hbs.registerPartials(partialsPath);
app.use(express.static(staticPath));
app.use(morgan('dev'));
app.use(express.json());
app.use('/', main_router);

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
const express = require("express");
const path = require("path");
const mountRoutes = require("./routes");
const config = require("./config");
const session = require("express-session");
const app = express();
const Schema = require('./Schema');
const mongoose = require("mongoose");
module.exports.port = app.get('port');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
mongoose.connect(config.mongodb, {useNewUrlParser: true, useFindAndModify: true}).then(() => app.db = Schema)
app.config = config;
app.use(session({saveUninitialized: true, resave: true, secret: config.session.secret}));
app.use(require("connect-flash")());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});
mountRoutes(app);
app.get("/", (req, res) => res.render("pastebin.ejs"));
app.use((req, res, next) => res.status(404).render("404.ejs"));
app.listen(app.get("port"), () => console.log("Listening to port %s", app.get("port")));
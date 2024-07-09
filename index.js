/** main entry point of the application. */

/* #region requiredModules */
require("./utils.js");
require("dotenv").config();
const express = require("express");

const app = express();

const session = require("express-session");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const axios = require("axios");

/* #endregion requiredModules */
/* #region userImports */
const saltRounds = 12;

const port = process.env.PORT || 4000;

const {
  isAuthenticated,
  createSession,
  getUsername,
  refreshCookieTime,
} = require("./scripts/localSession");

const {
  getMongoStore,
  getCollection,
} = require("./scripts/databaseConnection");

const userCollection = getCollection("users");

/* #endRegion userImports */
/* #region secrets */
const node_session_secret = process.env.NODE_SESSION_SECRET;
/* #endregion secrets */

/* #region expressPathing */
app.use(express.static(__dirname + "/public"));
app.use("/imgs", express.static("./imgs"));
app.use("/styles", express.static("./styles"));
app.use("/scripts", express.static("./scripts"));
/* #endregion expressPathing */

/* #region middleware */
app.use(
  session({
    secret: node_session_secret,
    store: getMongoStore(), //default is memory store
    saveUninitialized: false,
    resave: true,
  })
);

/**
 * sets the view engine to ejs, configures the express app,
 * and sets up the middleware for parsing url-encoded data.
 */
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

/**
 * Generate local variables we need for every page
 */
app.use((req, res, next) => {
  // console.log(req.session.user);
  refreshCookieTime(req);
  req.session.user != "undefined"
    ? (app.locals.user = req.session.user)
    : undefined;
  app.locals.authenticated = isAuthenticated(req);
  next();
});
/* #endregion middleware */

/* #region serverRouting */
app.get("/", async (req, res) => {
  var username = getUsername(req);
  var authenticated = isAuthenticated(req);

  res.render("index", {
    username: username,
    authenticated: authenticated,
    tvdata: await searchShows(req.query.search || "atypical")
  });
});

app.get("/login", (req, res) => {
  res.render("login", {});
});

app.post("/loggingin", async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  const usernameSchema = Joi.string().alphanum().min(3).max(30).required();
  const usernameValidationResult = usernameSchema.validate(username);
  if (usernameValidationResult.error != null) {
    console.error(usernameValidationResult.error);
    res.redirect("/login");
    return;
  }

  const result = await userCollection.find({ username: username }).toArray();
  if (result.length != 1) {
    res.redirect("/login");
    return;
  }
  if (await bcrypt.compare(password, result[0].password)) {
    const user = result[0];
    createSession(
      req,
      user.username,
    );
    res.redirect("/");
    return;
  } else {
    res.redirect("/login");
    return;
  }
});

app.get("/signup", (req, res) => {
  res.render("signup", { errors: [] });
});

app.post("/submitUser", async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var errors = [];

  const userSchema = Joi.object({
    username: Joi.string().alphanum().max(30).required(),
    password: Joi.string().max(20).required(),
  });

  const validationResult = userSchema.validate({ username, password });

  if (validationResult.error != null) {
    errors.push(validationResult.error.details[0].message);
  }

  //TODO: fix user collection
  if (await userCollection.findOne({ username: username })) {
    errors.push(`${username} is already in use!`);
  } 
  
  if (errors.length === 0) {
    var hashedPassword = await bcrypt.hash(password, saltRounds);

    await userCollection.insertOne({
      username: username,
      password: hashedPassword,
    });

    createSession(
      req,
      username,
    );

    res.redirect("/");
    return;
  }

  //Errors
  res.render("signup", {
    errors: errors,
  });
  return;
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

/* #region components */
app.get("/test", async (req, res) => {
  const temp = await searchShows("girls");
  res.send(temp); 
});

async function searchShows(search){
  let str = `<table class="container">
              <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>TV Show Title</th>
                  <th>Status</th>
              </tr>`;
  const result = await axios.get(`https://api.tvmaze.com/search/shows?q=${search}`);

  for (let i = 0; i < result.data.length; i++) {
    str += `<tr>
            <td>1</td>
            <td><img src="${result.data[i].show.image.medium}" alt=""></td>
            <td>${result.data[i].show.name}</td>
            <td><span class="fw-bold text-success">Completed</span></td>
          </tr>`;
  }
  str += "</table>";
  return str;
}
/* #endregion components */

app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});
/* #endregion serverRouting */

app.listen(port, () => {
  console.log("Node application listening on port " + port);
});

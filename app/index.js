/* #region imports */
require("./scripts/utils");
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const Joi = require("joi");
/* #endregion imports */

/* #region variables */
const SALTROUNDS = 10;
let error_message = "";
const PORT = process.env.PORT || 3000;
const expireTime = 24 * 60 * 60 * 1000;
/* #endregion variables */

/* #region debug vars */
const status_colors = {
	"current" : "#23b230",
	"completed" : "#26448f",
	"onhold" : "#f1c83e",
	"dropped" : "#a12f31",
	"planned" : "#c3c3c3"
}

const user_data = [
    {
        "_id" : {},
		"status" : "onhold",
		"image" : "https://static.tvmaze.com/uploads/images/medium_portrait/504/1262336.jpg",
		"title" : "Severance",
        "imdb": "tt11280740",
		"score" : 7.8,
		"type" : "TV",
		"progress" : {
            "season" : 1,
			"episode" : 9
        }
    }
];
/* #region debug vars */

/* #region app init */
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
/* #endregion app init */

/* #region database connection */
const { 
    userCollection,
    mongoSessions
} = require('./scripts/databaseConnection');

app.use(
    session({
        secret: process.env.NODE_SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: mongoSessions,
    }),
);
/* #endregion database connection */

/* #region authentication */
function isValidSession(req) {
    if (req.session.authenticated) {
        return true;
    }
    return false;
}

function sessionValidation(req, res, next) {
    if (isValidSession(req)) {
        next();
    } else {
        res.redirect("/login");
    }
}
/* #endregion authentication */

/* #region routing */
app.get('/', async (req, res) => {
    const authenticated = req.session.authenticated;
    if (!authenticated) {
        res.render("landing", {
            username: null,
            authenticated: authenticated
        });
        return;
    }

    res.render("index", {
        username: req.session.username,
        authenticated: authenticated,
        status_colors: status_colors,
        data: user_data
    });
});

/* #region signup */
app.get('/signup', (req, res) => {
    const err = req.query.err ? error_message : "";

    res.render("signup", {
        username: null,
        authenticated: req.session.authenticated,
        errors: err
    });
});

app.post('/signupSubmit', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const schema = Joi.object({
        username: Joi.string().alphanum().max(20).required(),
        password: Joi.string().max(20).required()
    });

    const validationResult = schema.validate({username, password});
	if (validationResult.error != null) {
       error_message = validationResult.error;
	   res.redirect(`/signup?err=1`);
	   return;
   }

    var hashedPassword = await bcrypt.hashSync(password, parseInt(SALTROUNDS));

    await userCollection.insertOne({
        username: username,
        password: hashedPassword,
    });

    req.session.authenticated = true;
    req.session.username = username;
    req.session.cookie.maxAge = expireTime;

    res.redirect("/");
});
/* #endregion signup */

/* #region login */
app.get('/login', (req, res) => {
    const err = req.query.err ? error_message : "";

    res.render("login", {
        username: null,
        authenticated: req.session.authenticated,
        errors: err
    });
});

app.post('/loggingIn', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    const schema = Joi.object({
        username: Joi.string().alphanum().max(20).required(),
        password: Joi.string().max(20).required()
    });

    const validationResult = schema.validate({username, password});
    if (validationResult.error != null) {
        error_message = validationResult.error;
        res.redirect(`/login?err=1`);
        return;
    }

    const data = await userCollection
        .find({username: username})
        .project({username: 1, password: 1, user_tv_data: 1})
        .toArray();

    if (data.length != 1) {
        error_message = "user not found.";
        res.redirect("login?err=1");
        return;
    }

    if (await bcrypt.compare(password, data[0].password)) {
        req.session.authenticated = true;
        req.session.username = data[0].username;
        req.session.cookie.maxAge = expireTime;

        res.redirect("/")
        return;
    } else {
        error_message = "user not found.";
        res.redirect("login?err=1");
        return;
    }
});

app.get('/logOut', (req, res) => {
    req.session.destroy();
    console.log("session ended.");
    res.redirect("/");
});
/* #endregion login */

app.get('/tvlist', sessionValidation, (req, res) => {
    let filtered_data = user_data;

    if (req.query.status) {
        filtered_data = user_data.filter((item) => {
            return item.status === req.query.status;
        });
        console.log(filtered_data);
    }

    res.render("index", {
        username: req.session.username,
        authenticated: req.session.authenticated,
        status_colors: status_colors,
        data: filtered_data
    });
});

app.get('*', (req, res) => {
    res.status(404).render("404", {
        authenticated: req.session.authenticated,
    })
});
/* #endregion routing */

// Start server
app.listen(PORT, () => {
    console.log("Server is running on PORT: " + PORT);
});
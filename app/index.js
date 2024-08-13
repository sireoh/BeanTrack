/* #region imports */
require("./scripts/utils");
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const Joi = require("joi");
const {
    compareTitle,
    compareStatus
} = require("./scripts/indexFunctions");
/* #endregion imports */

/* #region variables */
const SALTROUNDS = 10;
let error_message = "";
const PORT = process.env.PORT || 3000;
const expireTime = 24 * 60 * 60 * 1000;

const status_colors = {
	"current" : "#23b230",
	"completed" : "#26448f",
	"onhold" : "#f1c83e",
	"dropped" : "#a12f31",
	"planned" : "#c3c3c3"
}
/* #endregion variables */

/* #region app init */
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
/* #endregion app init */

/* #region database connection */
const {
    ObjectId,
    userCollection,
    tvOwnlist,
    movieOwnlist,
    mongoSessions
} = require('./scripts/databaseConnection');
const { format } = require("path");
const { stat } = require("fs");

app.use(
    session({
        secret: process.env.NODE_SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: mongoSessions,
    }),
);
app.use(express.json());
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
        data: {}
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
        .project({username: 1, password: 1, user_data: 1})
        .toArray();

    if (data.length != 1) {
        error_message = "user not found.";
        res.redirect("login?err=1");
        return;
    }

    if (await bcrypt.compare(password, data[0].password)) {
        req.session.authenticated = true;
        req.session.username = data[0].username;
        req.session.userData = data[0].user_data;
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

app.post('/searchOwnlist', (req, res) => {
    const search = req.body.search;
    res.redirect(`/tvlist/${req.session.username}?search=${search}`);
});

app.get('/tvlist/?:id', sessionValidation, async (req, res) => {
    const id = req.params.id;
    const search = req.query.search ? req.query.search : "";
    let filtered_data = req.session.userData ? req.session.userData : [];

    const getTVObjID = await userCollection
        .find({ username: id })
        .project({ tvlist: 1})
        .toArray();

    if (getTVObjID.length === 0) {
        return;
    } else {
        req.session.tvOwnlist = getTVObjID[0].tvlist;
    }

    const result = await tvOwnlist
        .find({ _id: req.session.tvOwnlist })
        .project({ data: 1})
        .toArray();

    filtered_data = result[0].data;
    req.session.userData = filtered_data;

    if (req.query.status) {
        filtered_data = req.session.userData.filter((item) => {
            return item.status === req.query.status;
        });
    }

    if (search !== "") {
        filtered_data = req.session.userData.filter((item) => {
            // TODO: diacritics dont work ...
            if (item.title.toLowerCase().normalize("NFD") === search) {
                return true;
            }

            return item.title.toLowerCase().startsWith(search);
        });
    }

    const alphabeticalData = filtered_data.sort( compareTitle );
    const dataByStatus = alphabeticalData.sort( compareStatus );

    res.render("tvlist", {
        username: req.session.username,
        authenticated: req.session.authenticated,
        status_colors: status_colors,
        data: dataByStatus,
        search: search
    });
});

app.post('/addShow', async (req, res) => {
    await tvOwnlist.updateOne(
        { _id: new ObjectId(req.session.tvOwnlist) },
        { $push: { data: req.body.data } }
    );

    console.log(`Added ${req.body.data.title} to the list, marked as ${req.body.data.status}`);
});

app.post('/addMovie', async (req, res) => {
   console.log(req.body);
});

app.post('/editItem', async (req, res) => {
    console.log(req.body);
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
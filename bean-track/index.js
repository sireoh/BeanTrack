/* #region imports */
require("./utils.js");
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const Joi = require("joi");
const {
    compareTitle,
    compareStatus
} = require("./scripts/indexFunctions.js");
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
    NumberInt,
    userCollection,
    tvOwnlist,
    movieOwnlist,
    mongoSessions
} = require('./scripts/databaseConnection.js');

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
    res.render("signup", {});
});

app.post('/signupSubmit', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    var errors = [];

    const schema = Joi.object({
        username: Joi.string().alphanum().max(20).required(),
        password: Joi.string().max(20).required()
    });

    const validationResult = schema.validate({username, password});

	if (validationResult.error != null) {
        errors.push(validationResult.error.details[0].message);
    }

    if (await userCollection.findOne({ username: username })) {
        errors.push(`${username} is already in use!`);
    } else if (errors.length === 0) {
        var hashedPassword = await bcrypt.hashSync(password, parseInt(SALTROUNDS));

        const newTVList = new ObjectId();
        const newMovieList = new ObjectId();

        await userCollection.insertOne({
            username: username,
            password: hashedPassword,
            tvlist: newTVList,
            movielist: newMovieList,
        });

        await tvOwnlist.insertOne({
            _id: newTVList,
            data: []
        });

        await movieOwnlist.insertOne({
            _id: newMovieList,
            data: []
        });

        req.session.authenticated = true;
        req.session.username = username;
        req.session.cookie.maxAge = expireTime;

        res.redirect("/");
        return;
    }

    res.render("signup", {
        errors: errors,
    });
    return;
});
/* #endregion signup */

/* #region login */
app.get('/login', (req, res) => {
    res.render("login", {});
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
        .project({ username: 1, password: 1, tvlist: 1, movielist: 1 })
        .toArray();

    if (data.length != 1) {
        error_message = "user not found.";
        res.redirect("/login?err=1");
        return;
    }

    if (await bcrypt.compare(password, data[0].password)) {
        req.session.authenticated = true;
        req.session.username = data[0].username;
        req.session.tvOwnlist = data[0].tvlist;
        req.session.movieOwnlist = data[0].movielist;
        req.session.cookie.maxAge = expireTime;

        res.redirect(`/tvlist/${req.session.username}`)
        return;
    } else {
        error_message = "user not found.";
        res.redirect("/login?err=1");
        return;
    }
});

app.get('/logOut', (req, res) => {
    req.session.destroy();
    console.log("session ended.");
    res.redirect("/");
});
/* #endregion login */

app.post('/searchOwnlist/:id', (req, res) => {
    const search = req.body.search;
    res.redirect(`/${req.params.id}/${req.session.username}?search=${search}`);
});

app.get('/tvlist/?:id', sessionValidation, async (req, res) => {
    const id = req.params.id;
    const search = req.query.search ? req.query.search : "";
    let filtered_data = req.session.userData ? req.session.userData : [];

    const getOwnlists = await userCollection
        .find({ username: id })
        .project({ tvlist: 1 })
        .toArray();

    if (getOwnlists.length === 0) {
        return;
    } else {
        req.session.tvOwnlist = getOwnlists[0].tvlist;
    }

    const result = await tvOwnlist
        .find({ _id: req.session.tvOwnlist })
        .project({ data: 1 })
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
        isTV: true,
        search: search
    });
});

app.get('/movielist/?:id', sessionValidation, async (req, res) => {
    const id = req.params.id;
    const search = req.query.search ? req.query.search : "";
    let filtered_data = req.session.userData ? req.session.userData : [];

    const getOwnlists = await userCollection
        .find({ username: id })
        .project({ movielist: 1 })
        .toArray();

    if (getOwnlists.length === 0) {
        return;
    } else {
        req.session.movieOwnlist = getOwnlists[0].movielist;
    }

    const result = await movieOwnlist
        .find({ _id: req.session.movieOwnlist })
        .project({ data: 1 })
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

    res.render("movielist", {
        username: req.session.username,
        authenticated: req.session.authenticated,
        status_colors: status_colors,
        data: dataByStatus,
        isTV: false,
        search: search
    });
});

app.get('/ownlist/?:id', async (req, res) => {
    const id = req.params.id;
    const type = req.query.type;
    
    if (!type) {
        res.send({error: `No "Type" param provided.`});
        return;
    }

    const getOwnlists = await userCollection
        .find({ username: id })
        .project({ tvlist: 1, movielist: 1 })
        .toArray();

    if (getOwnlists.length === 0) {
        return;
    }

    if (type === "tv") {
        req.session.tvOwnlist = getOwnlists[0].tvlist;

        const result = await tvOwnlist
            .find({ _id: req.session.tvOwnlist })
            .project({ data: 1 })
            .toArray();

        res.send(result[0].data);
        return;

    } else if (type === "movie") {
        req.session.movieOwnlist = getOwnlists[0].movielist;

        const result = await movieOwnlist
            .find({ _id: req.session.movieOwnlist })
            .project({ data: 1 })
            .toArray();

        res.send(result[0].data);
        return;
    }

    res.send({error: "Incorrect type."});
});

app.post('/addShow', async (req, res) => {
    console.log(req.body);

    await tvOwnlist.updateOne(
        { _id: new ObjectId(req.session.tvOwnlist) },
        { $push: { data: req.body.data } }
    );
});

app.post('/addMovie', async (req, res) => {
   await movieOwnlist.updateOne(
        { _id: new ObjectId(req.session.movieOwnlist) },
        { $push: { data: req.body.data } }
    );
});

app.post('/editItem', async (req, res) => {
    console.log(req.body.data.type);

    if (req.body.data.newStatus === "delete") {
        console.log(req.body.data.id);
        if (req.body.data.type === "tv") {
            await tvOwnlist.updateOne(
                { _id: new ObjectId(req.session.tvOwnlist) },
                { $pull: { "data": { id: new NumberInt(req.body.data.id) } } }
            );
        } else if (req.body.data.type === "movie") {
            await movieOwnlist.updateOne(
                { _id: new ObjectId(req.session.movieOwnlist) },
                { $pull: { "data": { id: req.body.data.id } } }
            );
        }
        return;
    }

    if (req.body.data.type === "tv") {
        await tvOwnlist.updateOne(
            { 
                _id: new ObjectId(req.session.tvOwnlist), 
                "data.id": new NumberInt(req.body.data.id) 
            },
            { 
                $set: { 
                    "data.$.status": req.body.data.newStatus 
                } 
            }
        );
        return;
    } else if (req.body.data.type === "movie") {
        await movieOwnlist.updateOne(
            { 
                _id: new ObjectId(req.session.movieOwnlist), 
                "data.id": req.body.data.id
            },
            { 
                $set: { 
                    "data.$.status": req.body.data.newStatus 
                } 
            }
        );
        return;
    }

    console.log("wtf is that");
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
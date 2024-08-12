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

const status_colors = {
	"current" : "#23b230",
	"completed" : "#26448f",
	"onhold" : "#f1c83e",
	"dropped" : "#a12f31",
	"planned" : "#c3c3c3"
}

let showDataResults = null;
/* #endregion variables */

/* #region app init */
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
/* #endregion app init */

/* #region database connection */
const { 
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
    const search = req.query.search ? req.query.search : "";

    if (!authenticated) {
        res.render("landing", {
            username: null,
            authenticated: authenticated
        });
        return;
    }

    const url = 'https://api.themoviedb.org/3/trending/tv/day?language=en-US';
    const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZGM0MDE1OWIzNWZiZTRjZDg4MDAwODZiMjA5YTI3NSIsIm5iZiI6MTcyMzE2MDMwNy42ODY1MzQsInN1YiI6IjY2OWY2MjY2YTVhYjlkOWYzZDcwMzVmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KV1NO_XnwxQIIw7xs6hZgAG_5EjRKwAQvD-jtLJvb2M'
    }
    };

    fetch(url, options)
        .then(res => res.json())
        .then(async (data) => {
            let buildData = [];

            for (let i = 0; i < data.results.length; i++) {
                // const imdb = await getIMDB(data.results[i].name, data.results[i].id);

                buildData.push({
                    "id": data.results[i].id,
                    "image": `https://image.tmdb.org/t/p/w500${data.results[i].poster_path}`,
                    "title": data.results[i].name,
                    // "imdb": `${imdb}`,
                    "summary": formatSummary(data.results[i].overview),
                    "score": data.results[i].vote_average
                });            
            }
            showDataResults = buildData;
            
            // res.send(buildData);
            // return;

            res.render("index", {
                username: req.session.username,
                authenticated: authenticated,
                status_colors: status_colors,
                data: buildData,
                search: search
            });
    })
    .catch(err => console.error('error:' + err));
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
    }

    const result = await tvOwnlist
        .find({ _id: getTVObjID[0].tvlist })
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

app.post('/searchShow', async (req, res) => {
    const search = req.body.search;
    await fetch(`https://api.tvmaze.com/search/shows?q=${search}`)
        .then((res) => res.json())
        .then((data) => {
            showDataResults = [];

            for (let i = 0; i < data.length; i++) {
                const img = data[i].show.image ? data[i].show.image.medium : "";
                const summary = data[i].show ? data[i].show.summary : "";
                
                try {
                    showDataResults.push({
                        "id": data[i].show.id,
                        "image": img,
                        "title": data[i].show.name,
                        "imdb": data[i].show.externals.imdb,
                        "summary": formatSummary(summary),
                        "score": data[i].show.rating.average
                    });
                } catch (error) {
                    // console.log(data[i]);
                }
            }

            res.redirect(`/showResults?search=${search}`);
        });
});

app.get('/showResults', (req, res) => {
    const search = req.query.search ? req.query.search : "";

    if (!search) {
        showDataResults = [];
    }

    res.render("showResults", {
        username: req.session.username,
        authenticated: req.session.authenticated,
        search: search,
        data: showDataResults
    });
});

app.post('/addShow', (req, res) => {
    console.log(req.body.data);
});

app.get('/addShow', (req, res) => {
    res.send(req.data);
    return;

    const id = req.query.id;
    const data = showDataResults.filter((item) => {
        return item.id == id;
    });

    userCollection.updateOne(
        { username: req.session.username },
        { $push: { user_data: {
            "id": data[0].id,
            "status": req.query.status,
            "image": data[0].image,
            "title": data[0].title,
            "imdb": data[0].imdb,
            "score": data[0].score,
            "type": "TV",
            "progress": []
        } } }
    );

    console.log(`Added ${data[0].title} to the list, marked as ${req.query.status}`);

    res.redirect("/tvlist");
});

function formatSummary(str) {
    return str
    .replace(/<\/?[^>]+(>|$)/g, "")
    .substring(0, 80)
    + (str.length > 80 ? " ..." : "");
}

async function getIMDB(name, id) {
    const url = `https://api.themoviedb.org/3/movie/${id}/external_ids`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZGM0MDE1OWIzNWZiZTRjZDg4MDAwODZiMjA5YTI3NSIsIm5iZiI6MTcyMzE2MDMwNy42ODY1MzQsInN1YiI6IjY2OWY2MjY2YTVhYjlkOWYzZDcwMzVmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KV1NO_XnwxQIIw7xs6hZgAG_5EjRKwAQvD-jtLJvb2M'
      }
    };
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log(name, id, data.imdb_id);
        return data.imdb_id || null;
    } catch (err) {
        console.error('Error:', err);
        return null;
    }
}

function compareTitle(a, b) {
    if ( a.title < b.title ){
        return -1;
      }
      if ( a.title > b.title ){
        return 1;
      }
      return 0;
}

function compareStatus(a, b) {
    const statusOrder = {
        current: 1,
        completed: 2,
        onhold: 3,
        dropped: 4,
        planned: 5
    }

    return statusOrder[a.status] - statusOrder[b.status];
}

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
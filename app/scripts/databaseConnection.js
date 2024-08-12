// Imports
require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;
const MongoStore = require('connect-mongo');

// Session secrets
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

// Mongo DB Connection
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const atlasURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}`;
var database = new MongoClient(atlasURI, {useNewUrlParser: true, useUnifiedTopology: true});

// User and session database
const userCollection = database.db(mongodb_database).collection('users');
const tvOwnlist = database.db(mongodb_database).collection('tvlist');
const movieOwnlist = database.db(mongodb_database).collection('movielist');
const mongoSessions = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
	crypto: {
		secret: mongodb_session_secret
	},
    collectionName: 'sessions'
})

// Export
module.exports = { 
    userCollection,
	tvOwnlist,
	movieOwnlist,
    mongoSessions
 };
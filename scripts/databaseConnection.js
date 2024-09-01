// Imports
require('dotenv').config();
const { ObjectId, Int32: NumberInt, MongoClient } = require("mongodb");
const MongoStore = require('connect-mongo');

// Session secrets
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

// Mongo DB Connection
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const atlasURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}`;

// Create a new MongoClient
const client = new MongoClient(atlasURI);

// Connect to the database
client.connect().then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("Failed to connect to MongoDB", err);
});

// User and session database
const database = client.db(mongodb_database);
const userCollection = database.collection('users');
const tvOwnlist = database.collection('tvlist');
const movieOwnlist = database.collection('movielist');

const mongoSessions = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
    crypto: {
        secret: mongodb_session_secret
    },
    collectionName: 'sessions'
});

// Export
module.exports = {
    ObjectId,
    NumberInt,
    userCollection,
    tvOwnlist,
    movieOwnlist,
    mongoSessions,
    client  // Exporting the client for closing the connection when needed
};
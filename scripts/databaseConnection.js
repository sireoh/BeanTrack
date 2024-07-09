require("dotenv").config();

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const MongoClient = require("mongodb").MongoClient;
const MongoStore = require("connect-mongo");

const database = getMongoClient();

function getMongoClient() {
  const atlasURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true`;
  return new MongoClient(atlasURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

function getMongoStore() {
  return MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
    crypto: {
      secret: mongodb_session_secret,
    },
  });
}

function getCollection(collection) {
  return database.db(mongodb_database).collection(collection);
}

module.exports = { getMongoStore, getCollection };

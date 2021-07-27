const path = require('path'); 
const fs = require('fs');
const dotenv = require('dotenv');
const result = dotenv.config({path: path.resolve(__dirname, "../.env")});

if (result.error) {
  throw result.error;
}

//Exports config variables defined in ../.env
module.exports = {
  MONGO_DB_PASSWORD : process.env.MONGO_DB_PASSWORD,
};
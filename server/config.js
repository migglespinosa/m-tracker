const dotenv = require('dotenv');
const path = require('path'); 
const fs = require('fs');

const result = dotenv.config({path: path.resolve(__dirname, "../.env")});

//TESTING
const test_path = path.resolve(__dirname, "../.env")
console.log("test_path ", test_path)
console.log("Exists: ", fs.existsSync(test_path));

if (result.error) {
  throw result.error;
}

module.exports = {
  MONGO_DB_PASSWORD : process.env.MONGO_DB_PASSWORD,
};
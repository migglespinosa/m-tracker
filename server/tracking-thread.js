const {workerData, parentPort} = require('worker_threads');
const { MongoClient } = require('mongodb');
const { MONGO_DB_PASSWORD } = require('./config.js');

const uri = "mongodb+srv://tracker-master:"
const path = MONGO_DB_PASSWORD + "@cluster0.bksvx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const client = new MongoClient(uri + path, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

//Parse data into JSON
const message = JSON.parse(workerData);
const session = message.body;

//Iterate through batch
session.data.forEach(elem => {

    //Send data to respective collections in MongoDB
    if(elem.page_name.includes("Home")){
        parentPort.postMessage(elem);
    }

    if(elem.page_name.includes("Page A")){
        parentPort.postMessage(elem);
    }

    if(elem.page_name.includes("Page B")){
        parentPort.postMessage(elem);
    }
    
})


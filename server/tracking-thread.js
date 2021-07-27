const {workerData, parentPort} = require('worker_threads');
const { MongoClient } = require('mongodb');
const { MONGO_DB_PASSWORD } = require('./config.js');

//Initialize MongoDB client
const uri = "mongodb+srv://tracker-master:"
const path = MONGO_DB_PASSWORD + "@cluster0.bksvx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri + path, { useNewUrlParser: true, useUnifiedTopology: true });

//Parse data into JSON
const message = JSON.parse(workerData);
const session = message.body;

//Send data to MongoDB
async function write_data(){

    try{
        //Insert a document to database "db_test" in collection "collection_test"
        await client.connect();
        const db_test = client.db("db_test");
        const collection_test = db_test.collection("collection_test");
        const result = await collection_test.insertOne(session);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
    }
    catch(error){
        console.error(error);
    }
}

write_data();

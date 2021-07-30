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
const time_stamp = session.load_time;
const account_number = session.account_number;

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

/*
Potential algorithm for updating a session in mongodb:
- Check if page_session.click_events and page_session.hover_events are empty.
    - If Yes, write_data()
    - Else, pass

- Find if site_session document already exists by looking for an account number + load time match.
- If doesn't exist, add body
- Else:
    - Grab most the recent page-session in workerData 
    - Find site-session by account number + load time 
    and return most recent page-session in the mongoDB   
    - Check if page-sessions' name and load times match
        - If matching, append click-data and hover-data to MongoDB page-session
        - Else, append entire rest of page-session to MongoDB
*/

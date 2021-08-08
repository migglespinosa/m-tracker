const {workerData, parentPort} = require('worker_threads');
const { MongoClient } = require('mongodb');
const { MONGO_DB_PASSWORD } = require('./config.js');

//REMINDER: MongoDB driver has difficulty bulk updating fields of array elements in a document.

//Initialize MongoDB client
const uri = "mongodb+srv://tracker-master:"
const path = MONGO_DB_PASSWORD + "@cluster0.bksvx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri + path, { useNewUrlParser: true, useUnifiedTopology: true });

//Parse data into JSON
const message = JSON.parse(workerData);
const site_session = message.body;
const load_time = site_session.load_time;
const account_number = site_session.account_number;

//Grab load_time and page_name of the oldest page_session submitted to thread
const oldest_page_session_load_time = site_session.page_sessions[0].load_time;
const oldest_page_session_page_name = site_session.page_sessions[0].page_name;
const oldest_page_session_hover_data = site_session.page_sessions[0].hover_data;
const oldest_page_session_click_data = site_session.page_sessions[0].click_data;

let oldest_page_session_unload_time;
if(site_session.page_sessions.length > 1){
    oldest_page_session_unload_time = site_session.page_sessions[0].unload_time;
}

let remaining_page_sessions;
if(site_session.page_sessions.length >= 1){
    remaining_page_sessions = site_session.page_sessions.slice(1);
}

console.log("oldest_page_session_click_data", oldest_page_session_click_data);

//Write data to MongoDB
async function write_data(){

    try{

        //Get site_session document where document.load_time is equal to load_time and document.account_number is equal to account_number
        const site_session_query = { $and: [{load_time: {$eq: load_time}}, {account_number: {$eq: account_number}}]};
        const site_session_filter = site_session_query;
        
        //Append click_data and hover_data of the oldest page session sumbitted to the thread to the most recent page session in MongoDB
        const site_session_update_click_hover = {
            $push: {
                "page_sessions.$[page].click_data": {"$each": oldest_page_session_click_data},
                "page_sessions.$[page].hover_data": {"$each": oldest_page_session_hover_data}
            }
        }
        
        const site_session_append_page = {
            $push: {
                "page_sessions": {"$each": remaining_page_sessions}
            }
        }
        
        const operations = {
            updateOne: { filter: site_session_filter, update: site_session_update_click_hover, upsert: true },
            updateOne: { filter: site_session_filter, update: site_session_append_page, upsert: true }
        }

        //Find the page_session whose load_time and page_name are equal to the submitted oldest page sessions's load_time and page_time
        const options = {
            arrayFilters: [{
                "page.load_time" : oldest_page_session_load_time, 
                "page.page_name" : oldest_page_session_page_name
            }]
        };

        //Insert a document to database "db_test" in collection "collection_test"
        await client.connect();
        const db_test = client.db("db_test");
        const collection_test = db_test.collection("collection_test");
        const site_session_result = await collection_test.findOne(site_session_query);

        //If site_session can't be found in MongoDB, post the site_session submitted by the thread
        //Else, update respective document
        if(!site_session_result){
            const result = await collection_test.insertOne(site_session);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
        }
        else{
            //const result = await collection_test.updateOne(site_session_filter, site_session_update, options);
            console.log("oldest_page_session_unload_time: ", oldest_page_session_unload_time)
            const result = await collection_test.bulkWrite([operations], options);
            console.log("Document updated");
        }

    }
    catch(error){
        console.error(error);
    }
}

//Returns false if no new pages were switched and no click or hover data were appended
function new_data(site_session){

    if( (site_session.page_sessions.length == 1) &&
        (site_session.page_sessions[0].click_data.length == 0) && 
        (site_session.page_sessions[0].hover_data.length == 0) &&
        (site_session.page_sessions[0].unload_time == null)){
        return false;
    }
    else{
        return true;
    }
    
}

//Only writes to MongoDB if there is new session data
if(new_data(site_session) == true){
    write_data();
}

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
    - Append entire rest of page-session to MongoDB
*/

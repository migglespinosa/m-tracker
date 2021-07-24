const WebSocket = require('ws');
const {Worker, workerData} = require('worker_threads');

const socket = new WebSocket.Server({
    port: 8080
})

/*
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://tracker-master:<password>@cluster0.bksvx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
*/

//TIP: To only allow GET, POST access from a certain domain, read these:
//https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
//https://www.freecodecamp.org/news/how-to-secure-your-websocket-connections-d0be0996c556/
//https://www.neuralegion.com/blog/websocket-security-top-vulnerabilities/

//If SSL handshake is successful, output "ws connection initiated"
socket.on("connection", function(ws){

    console.log("Connection successful")

    //If WS message received, output payload data
    ws.on("message", function(message){

        console.log("Message: " + JSON.stringify(JSON.parse(message)));
        const worker = new Worker("./tracking-thread.js", {workerData: message});
        worker.on('message', (value) => {console.log("value: " + JSON.stringify(value))} );
        
    });

});



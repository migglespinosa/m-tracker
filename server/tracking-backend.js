const WebSocket = require('ws');
const {Worker, workerData} = require('worker_threads');
const { TEST_ENV } = require('./config.js');

const socket = new WebSocket.Server({
    port: 8080
})

//TIP: To only allow GET, POST access from a certain domain, read these:
//https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
//https://www.freecodecamp.org/news/how-to-secure-your-websocket-connections-d0be0996c556/
//https://www.neuralegion.com/blog/websocket-security-top-vulnerabilities/

//If SSL handshake is successful, output "ws connection initiated"
socket.on("connection", function(ws){

    console.log("Connection successful")
    console.log("Test ENV is ", TEST_ENV)

    //If WS message received, output payload data
    ws.on("message", function(message){

        console.log("Message: " + JSON.stringify(JSON.parse(message)));
        const worker = new Worker("./tracking-thread.js", {workerData: message});
        worker.on('message', (value) => {console.log("value: " + JSON.stringify(value))} );
        
    });

});



const WebSocket = require('ws');
const {Worker, workerData} = require('worker_threads');

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

    //If WS message received, output payload data
    ws.on("message", function(message){

        //const data = JSON.parse(message.body);
        //const oldest_page_session_click_data = data.page_sessions[0].click_data;

        //console.log("[message]: oldest_page_session_click_data", oldest_page_session_click_data)

        console.log("Message: " + JSON.stringify(JSON.parse(message)));
        const worker = new Worker("./tracking-thread.js", {workerData: message});
        worker.on('message', (value) => {console.log("value: " + JSON.stringify(value))} );
        
    });

});



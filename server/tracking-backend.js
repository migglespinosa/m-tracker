const WebSocket = require('ws');

const socket = new WebSocket.Server({
    port: 8080
})

//If SSL handshake is successful, output "ws connection initiated"
socket.on("connection", function(ws){

    console.log("Connection successful")

    //If WS message received, output payload data
    ws.on("message", function(message){
        console.log("Message: "+ message)
    });

});

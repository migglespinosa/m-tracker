const {workerData, parentPort} = require('worker_threads');

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


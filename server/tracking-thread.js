const {workerData, parentPort} = require('worker_threads');

//Parse data into JSON
const batch = JSON.parse(workerData);

//Iterate through batch
batch.forEach(elem => {

    //Send data to respective collections in MongoDB
    if(elem.header.includes("event_data")){
        parentPort.postMessage(elem);
    }

    if(elem.header.includes("position_data")){
        parentPort.postMessage(elem);
    }
    
})




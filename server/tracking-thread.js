const {workerData, parentPort} = require('worker_threads');

//Parse data and send to respective collections in MongoDB
const batch = JSON.parse(workerData);

//Iterate through batch
batch.forEach(elem => {

    if(elem.header.includes("event_data")){
        parentPort.postMessage(elem);
    }

    if(elem.header.includes("position_data")){
        parentPort.postMessage(elem);
    }
    
})




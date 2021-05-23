const M_tracker = function(init){

    let batch = []; 
    let add_tracking = init.add_tracking;
    let account_number = init.account_number;

    //Open Websocket connection

    //Batching logic (Requests are event-driven):
    //1. Element is added to the batch
        //a. If push method is not locked, copy element to batch_stage
        //b. Else, keep element in batch
    //2. Element is added to batch_stage 
        //a. If element is the only one in batch_stage, set delay for WebSocket POST request in 10 seconds
    //3. At 10 seconds
        //a. Lock push method
        //b. Perform POST request
    //4. Await response. 
        //a. If successful:
            //i. Clear batch_stage and intersection of batch_stage and batch
            //ii. Unlock push method
            //iii. Copy queued elements to batch_stage
        //b. Else: 
            //Retry logic


    //Account number required
    if(account_number){  

        return {
            //If tracking is enabled and operation is supported, push ['operation', 'descriptor'] to batch
            track : (elem) => {      
                if(!add_tracking){
                    return;
                }

                if(!supportedOperation(elem)){
                    return;
                }

                batch.push([elem]);
            },

            //Enable tracking
            add_tracking : () => {
                add_tracking = true;
            },

            //Disable tracking
            remove_tracking : () => {
                add_tracking = false;
            },

            //----------TEST METHODS-------------//
            view_batch : () => {
                console.log("Batch :" + batch)
            }

        }
    }
    else{

        alert("Account number required!")
        return null;

    }      
}

//---------------HELPER DATA-------------------//

//Supported operations
const operations = ['track', 'send_batch'];

//---------------HELPER METHODS----------------//

//Returns true or false depending on whether m_tracker supports the operation
function supportedOperation(elem){

    if(elem.length != 2){
        alert("Not long enough")
        return false;
    }

    if(operations.includes(elem[0]) == true){
        return true;
    }
    else{
        alert("Not supported")
        return false;
    }

}


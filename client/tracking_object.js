const M_tracker = function(init){

    let add_tracking = init.add_tracking;
    let account_number = init.account_number;
    let batch = [];
    let initial_time = Date.now();

    const url = 'ws://localhost:8080';
    const socket = new WebSocket(url); //Open WebSocket connection

    const validInitialization = account_number != null;
        
    //Account number required
    if(validInitialization){  

        return {
            //If tracking is enabled and operation is supported, push ['operation', 'descriptor'] to batch
            track : (elem) => {      

                if(!add_tracking){
                    return;
                }

                if(!supportedOperation(elem)){
                    return;
                }

                post_batch(elem);
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
                console.log(JSON.stringify(batch))
            }

        }
    }
    else{

        alert("Account number required!")
        return null;

    }

    function format_elem(elem){

        return {
            method: "POST",
            url: "/userdata?account_num="+account_number+"&service="+elem[0]+"&tag"+elem[1],
            timestamp: Date.now(),
            id: batch.length + 1
        }

    }

    function post_batch(elem){

        //If batch is empty, send batch to websocket in 30 seconds.
        if(batch.length == 0){
            
            setTimeout(function(){

                socket.send(batch);
                batch = [];
                
            }, 30000);

        }

        batch.push(format_elem(elem));

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


const M_tracker = function(init){

    let account_number = init.account_number;
    let add_tracking = init.add_tracking;
    let add_session_tracking = init.add_session_tracking; 
    let add_mouse_tracking = init.add_mouse_tracking;

    let load_time;
    let unload_time;

    let batch = [];
    let position_batch = [];

    const url = 'ws://localhost:8080';
    const socket = new WebSocket(url); //Open WebSocket connection
    const validInitialization = account_number != null;

    //Account number required
    if(validInitialization){  

        add_session_tracking && track_session_time();
        add_mouse_tracking && track_mouse();

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

            //Enable session time tracking
            add_session_tracking : () => {
                add_session_tracking = true;
            },

            //Enable session time tracking
            remove_session_tracking : () => {
                add_session_tracking = false;
            },

            //Enable mouse tracking
            add_mouse_tracking : () => {
                add_mouse_tracking = true;
            },

            //Remove mouse tracking
            remove_mouse_tracking : () => {
                add_mouse_tracking = false;
            },

            //----------TEST METHODS-------------//
            view_batch : () => {
                console.log(JSON.stringify(batch));
            },

            view_loadtime : () => {
                console.log("Initial load: " + load_time);
            },

            view_position_batch : () => {
                console.log("Position batch: "+JSON.stringify(position_batch));
            }
        }
    }
    else{

        alert("Account number required!")
        return null;

    }

    function format_elem(elem){

        const today = new Date();

        return {

            method: "POST",
            url: "/userdata?account_num="+account_number+"&service="+elem[0]+"&tag"+elem[1],
            time: today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
            date: today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(),
            id: batch.length + 1

        };

    }

    function post_batch(elem){
        //If batch is empty, send batch to websocket in 30 seconds.
        if(batch.length == 0){
            
            setTimeout(function(){
                socket.send(JSON.stringify(batch));
                batch = [];
            }, 10000);

        }

        batch.push(format_elem(elem));

    }


    function track_session_time(){

        //If add_session_tracking is true, set load_time on load event and unload_time on unload eventgit

        window.addEventListener('load', (event) => {
            load_time = new Date();
        });

        window.addEventListener('beforeunload', (event) => {
            unload_time = new Date();
            diff = new Date(unload_time-load_time);
            socket.send(diff.getSeconds());
        });

    }


    function track_mouse(){

        setInterval(() => {
            
            socket.send(JSON.stringify(position_batch));
            position_batch = [];

        }, 30000);

        window.addEventListener('mousemove', record_position);
        window.addEventListener('mouseenter', record_position);
        window.addEventListener('mouseleave', record_position);

    }

    function record_position(event){

        position_batch.push({x: event.pageX, y: event.pageY});

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

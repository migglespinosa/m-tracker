const M_tracker = function(init){

    let account_number = init.account_number;
    let add_event_tracking = init.add_event_tracking;
    let add_session_tracking = init.add_session_tracking; 
    let add_mouse_tracking = init.add_mouse_tracking;
    let add_bounce_tracking = init.add_bounce_tracking;
    let add_exit_tracking = init.add_exit_tracking;

    let load_time;
    let unload_time;

    let event_data = [];
    let position_data = [];
    let page_session_data = [];

    const url = 'ws://localhost:8080';
    const socket = new WebSocket(url); //Open WebSocket connection
    const validInitialization = account_number != null; //Account number required

    //If initialization variable 
    if(validInitialization){  

        add_session_tracking && track_session_time();
        add_mouse_tracking && track_mouse();
        add_bounce_tracking || add_exit_tracking && send_page_session_data();

        run_batch();

        return {
            //If tracking is enabled and operation is supported, push ['operation', 'descriptor'] to batch
            track : (elem) => {      

                if(!add_event_tracking){
                    return;
                }

                if(!supportedOperation(elem)){
                    return;
                }

                event_data.push(format_elem(elem));
            },

            //Enable tracking
            add_event_tracking : () => {
                add_event_tracking = true;
            },

            //Disable tracking
            remove_event_tracking : () => {
                add_event_tracking = false;
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

            //Adds a new page to page_session_data
            track_new_page : (page) => {
                page_session_data.push(page);
            },

            //----------TEST METHODS-------------//
            view_event_data : () => {
                console.log(JSON.stringify(event_data));
            },

            view_loadtime : () => {
                console.log("Initial load: " + load_time);
            },

            view_position_data : () => {
                console.log("Position batch: "+JSON.stringify(position_data));
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

            tag: elem[1],
            time: today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
            date: today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(),
            id: event_data.length + 1 //Change to random #?

        };

    }

    function track_session_time(){

        window.addEventListener('load', (event) => {
            load_time = new Date();
        });

        window.addEventListener('beforeunload', (event) => {
            unload_time = new Date();
            diff = new Date(unload_time-load_time);

            //REPLACE
            socket.send(diff.getSeconds());
        });

    }

    function track_mouse(){

        window.addEventListener('mousemove', record_position);
        window.addEventListener('mouseenter', record_position);
        window.addEventListener('mouseleave', record_position);

    }

    //Callback that pushes [x-coordinate, y-coordinate] to position_data
    function record_position(event){

        position_data.push([event.pageX, event.pageY]);

    }

    //------------BATCH METHODS------------//

    function run_batch(){

        //Send data every 30 seconds
        setInterval(() => {

            let requests = format_requests();
            socket.send(requests);
            clear_requests();
            
        }, 10000)

        //If page is closed before 30 second interval elapses, send remaining data
        window.addEventListener('beforeunload', (event) => {

            let requests = format_requests();
            socket.send(requests);

        });

    }

    function format_requests(){

        let formatted_requests = [];

        if(add_event_tracking){
            formatted_requests.push({
                header: "POST /userdata/event_data?account_num=" +account_number+" HTTP/1.1",
                content_type: "application/http",
                body: [...event_data]
            })
        }
        
        if(add_mouse_tracking){
            formatted_requests.push({
                header: "POST /userdata/position_data?account_num=" +account_number+" HTTP/1.1",
                content_type: "application/http",
                body: [...position_data]
            })
        }

        return formatted_requests;
        
    }

    function clear_requests(){

        event_data = [];
        position_data = [];

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

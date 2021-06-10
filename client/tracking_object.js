const M_tracker = function(init){

    let account_number = init.account_number;
    let add_event_tracking = init.add_event_tracking;
    let add_session_tracking = init.add_session_tracking; 
    let add_mouse_tracking = init.add_mouse_tracking;
    let add_bounce_tracking = init.add_bounce_tracking;
    let add_exit_tracking = init.add_exit_tracking;

    let event_data = [];
    let position_data = [];
    let page_session_data = [];

    //INSERT: Default current page

    const url = 'ws://localhost:8080';
    const socket = new WebSocket(url); //Open WebSocket connection
    const validInitialization = account_number != null; //Account number required

    //If initialization variable 
    if(validInitialization){  

        add_session_tracking && track_session_time();
        add_mouse_tracking && track_mouse();
        add_bounce_tracking || add_exit_tracking && track_page_session_data();

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
                //REFACTOR: Push to current page in site_session
                event_data.push(format_event(elem));
            },

            //Adds a new page to page_session_data
            page_change : (page) => {

                //REFACTOR: 
                // -Changes current page on session
                // -Sets unload time to previous current page
                // -Sets load time to current page
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

    //Track time between site load and unload
    function track_session_time(){

        let load_time;
        let unload_time;
    
        window.addEventListener('load', (event) => {
            load_time = new Date();
        });

        window.addEventListener('beforeunload', (event) => {
            unload_time = new Date();
            diff = new Date(unload_time-load_time);
            socket.send(JSON.stringify(format_session_time(diff)));
        });

    }

    //Before window closes, send page sessions to server
    function track_page_session_data(){

        window.addEventListener('beforeunload', (event) => {
            socket.send(JSON.stringify(format_page_session_data));
        });

    }

    //Track mouse position
    function track_mouse(){

        window.addEventListener('mousemove', record_position);
        window.addEventListener('mouseenter', record_position);
        window.addEventListener('mouseleave', record_position);

    }

    //Callback that pushes [x-coordinate, y-coordinate] to position_data
    function record_position(event){

        //REFACTOR: Push to current page in site_session
        position_data.push([event.pageX, event.pageY]);

    }

    //------------BATCH METHODS------------//

    function run_batch(){

        //Send data every 30 seconds
        //REFACTOR: Sends all data in page_session. Also clears all data except load time and unique ID in current page
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

    function clear_requests(){

        event_data = [];
        position_data = [];

    }

    //------------FORMATTING METHODS--------------//

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

    function format_event(elem){

        const today = new Date();

        return {
            tag: elem[1],
            time: today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
            date: today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(),
            id: event_data.length + 1 //Change to random #?
        };

    }

    function format_session_time(time){

        return {
            header: "POST /userdata/session_time?account_num=" +account_number+" HTTP/1.1",
            content_type: "application/http",
            body: time.getSeconds()
        }

    }

    function format_page_session_data(){

        const page_session_data = {
            exit_time: today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
            exit_date: today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(), 
            page_session: [page_session_data]
        };

        return {
            header: "POST /userdata/page_session_data?account_num=" +account_number+" HTTP/1.1",
            content_type: "application/http",
            body: page_session_data
        }

    }


    //Finish logic for individual page views
    function format_page_session_element(page){

        return {
            open_time: "",
            close_time: "",
            page: page,
        }

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

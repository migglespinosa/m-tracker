const M_tracker = function(init){

    let account_number = init.account_number;
    let add_event_tracking = init.add_event_tracking;
    let add_session_tracking = init.add_session_tracking; 
    let add_mouse_tracking = init.add_mouse_tracking;

    let session = new Session();
    let current_page = new Page('Home'); 

    //INSERT: Default current page

    const url = 'ws://localhost:8080';
    const socket = new WebSocket(url); //Open WebSocket connection
    const validInitialization = account_number != null; //Account number required

    //If initialization variable 
    if(validInitialization){  

        add_session_tracking && track_session_time();
        add_mouse_tracking && track_mouse();

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
                
                current_page.event_data.push(elem);

            },

            //Adds a new page to page_session_data
            page_change : (page) => {

                if(!page){
                    alert("No page specified");
                }
                
                current_page.unload_time = getCurrentTime();
                session.push(current_page);
                current_page = new Page(page);

            },

            //----------TEST METHODS-------------//
            view_event_data : () => {
                console.log(JSON.stringify(current_page.event_data));
            },

            view_loadtime : () => {
                console.log("Initial load: " + current_page.load_time);
            },

            view_position_data : () => {
                console.log("Position batch: "+JSON.stringify(current_page.position_data));
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

    //Track mouse position
    function track_mouse(){

        window.addEventListener('mousemove', record_position);
        window.addEventListener('mouseenter', record_position);
        window.addEventListener('mouseleave', record_position);

    }

    //Callback that pushes [x-coordinate, y-coordinate] to position_data
    function record_position(event){

        current_page.position_data.push([event.pageX, event.pageY]);

    }

    //------------BATCH METHODS------------//

    function run_batch(){

        //Send data every 30 seconds
        setInterval(() => {
            let current_page_copy = Object.assign({}, current_page);
            session.push(current_page_copy);
            console.log("session "+ JSON.stringify(session));
            socket.send(format_session_data(session));
            clear_data();
        }, 10000)

        //If page is closed before 30 second interval elapses, send all data
        window.addEventListener('beforeunload', (event) => {
            session.push(current_page);
            socket.send(format_session_data(session));
        });

    }

    function clear_data(){

        session.data = [];
        current_page.event_data = [];
        current_page.position_data = [];

    }

    //------------FORMATTING METHODS--------------//

    function format_session_time(time){

        return {
            header: "POST /userdata/session_time?account_num=" +account_number+" HTTP/1.1",
            content_type: "application/http",
            body: time.getSeconds()
        }

    }

    function format_session_data(data){

        return {
            header: "POST /userdata/session_data?account_num=" +account_number+" HTTP/1.1",
            content_type: "application/http",
            body: data
        }

    }

    //----------------OBJECT METHODS---------------//

    function Page(name){

        this.name = name;
        this.load_time = getCurrentTime();
        this.unload_time =  null;
        this.event_data = [];
        this.position_data = [];

    }

    function Session(){

        this.load_time = getCurrentTime();
        this.track_session_time = null;
        this.data = [];
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

function getCurrentTime(){

    const today = new Date();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

    return time + ' ' + date;
}

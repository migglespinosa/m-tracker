const M_tracker = function(init){

    let account_number = init.account_number;
    let add_event_tracking = init.add_event_tracking;
    let add_session_tracking = init.add_session_tracking; 
    let add_mouse_tracking = init.add_mouse_tracking;

    let site_session_data = [];
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
                //REFACTOR: Push to current page in site_session
                current_page.event_data.push(elem);

            },

            //Adds a new page to page_session_data
            page_change : (page) => {

                if(!page){
                    alert("No page specified");
                }
                
                current_page.unload_time = getCurrentTime();
                site_session_data.push(current_page);
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

        //REFACTOR: Push to current page in site_session
        current_page.position_data.push([event.pageX, event.pageY]);

    }

    //------------BATCH METHODS------------//

    function run_batch(){

        //Send data every 30 seconds
        //REFACTOR: Sends all data in site_session_data. Also clears all data except load time and name in current page
        setInterval(() => {
            let current_page_copy = Object.assign({}, current_page);
            site_session_data.push(current_page_copy);
            socket.send(format_session_data(site_session_data));
            clear_current_page();
        }, 10000)

        //If page is closed before 30 second interval elapses, send all data
        window.addEventListener('beforeunload', (event) => {
            site_session_data.push(current_page);
            socket.send(format_session_data(site_session_data));
        });

    }

    function clear_current_page(){

        site_session_data = [];
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

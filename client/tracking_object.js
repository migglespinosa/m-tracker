const M_tracker = function(init){

    let account_number = init.account_number;
    let add_event_tracking = init.add_event_tracking;
    let add_mouse_tracking = init.add_mouse_tracking;

    let session = new Session();
    let current_page = new Page('Home'); 

    const url = 'ws://localhost:8080';
    const socket = new WebSocket(url); //Open WebSocket connection
    const validInitialization = account_number != null; //Account number required

    //If configured correctly, return object method API
    if(validInitialization){  

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
                session.data.push(current_page);
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

    //Track mouse position
    function track_mouse(){

        window.addEventListener('mousemove', record_position);
        window.addEventListener('mouseenter', record_position);
        window.addEventListener('mouseleave', record_position);

    }

    //Callback that pushes [x-coordinate, y-coordinate] to current_page.position_data
    function record_position(event){

        current_page.position_data.push([event.pageX, event.pageY]);

    }

    //------------BATCH METHODS------------//

    function run_batch(){

        //Sends data every 30 seconds
        setInterval(() => {

            //1. Copy state of current_page and push into session.data
            //2. Send session to WebSocket
            //3. Clear recently posted data to save memory
            let current_page_copy = Object.assign({}, current_page);
            session.data.push(current_page_copy);
            console.log("session "+ JSON.stringify(session));
            socket.send(format_session(session));
            clear_data();


        }, 10000)

        //Sends data when window is closed
        window.addEventListener('beforeunload', (event) => {

            //1. Set unload times for current page and session
            //2. Push current page to session
            //3. Send session to WebSocket
            current_page.unload_time = getCurrentTime();
            session.unload_time = getCurrentTime();
            session.data.push(current_page);
            socket.send(format_session(session));
        });

    }

    //Clears disposable data
    function clear_data(){

        session.data = [];
        current_page.event_data = [];
        current_page.position_data = [];

    }

    //-----------------FORMATTING METHODS--------------//

    function format_session(data){

        return {
            header: "POST /userdata/session_data?account_num=" +account_number+" HTTP/1.1",
            content_type: "application/http",
            body: data
        }

    }

    //----------------OBJECT CONSTRUCTORS---------------//

    function Page(name){

        this.name = name;
        this.load_time = getCurrentTime();
        this.unload_time =  null;
        this.event_data = [];
        this.position_data = [];

    }

    function Session(){

        this.load_time = getCurrentTime();
        this.unload_time = null;
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

//Returns timestamp 
function getCurrentTime(){

    const today = new Date();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

    return time + ' ' + date;
}

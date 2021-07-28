const M_tracker = function(init){

    let account_number = init.account_number;
    let add_event_tracking = init.add_event_tracking;
    let add_hover_tracking = init.add_hover_tracking;

    let session = new Site_Session();
    let current_page = new Page_Session('Home'); 

    const url = 'ws://localhost:8080';
    const socket = new WebSocket(url); //Open WebSocket connection
    const validInitialization = account_number != null; //Account number required

    //If configured correctly, return object method API
    if(validInitialization){  

        add_hover_tracking && track_hover();
        run_batch();

        return {
            //If tracking is enabled and operation is supported, push ['operation', 'descriptor'] to batch
            track_click : (elem) => {      

                if(!add_event_tracking){
                    return;
                }
                
                click = new Click_Event(elem);
                current_page.click_data.push(click);

            },

            track_hover : track_hover,

            //Adds a new page to page_session_data
            page_change : (page) => {

                if(!page){
                    alert("No page specified");
                }
                
                current_page.unload_time = getCurrentTime();
                session.data.push(current_page);
                current_page = new Page_Session(page);

            },

            //----------TEST METHODS-------------//
            view_click_data : () => {
                console.log(JSON.stringify(current_page.click_data));
            },

            view_loadtime : () => {
                console.log("Initial load: " + current_page.load_time);
            },

            view_hover_data : () => {
                console.log("Hover data: "+JSON.stringify(current_page.hover_data));
            }
        }
    }
    else{

        alert("Account number required!")
        return null;

    }
    //ARGS: 
    //Identify an element by with a css class or id selector.
    //Set a timer for how long a mouse can hover over the element until hover_data is updated
    function track_hover(identifier, time){

        //Default time is 3 sec
        if(!time){
            time = 3000;
        }

        //Check first character to determine if identifier is class or id selector
        if(identifier.charAt(0) == "#"){
            monitor_element_id(identifier, time);
        }
        else if(identifier.charAt(0) == "."){
            monitor_elements_class(identifier, time);
        }
        else{
            console.log("element not found")
            return;
        }
    }

    function monitor_element_id(identifier, time){

        //Find element by id
        search_identifier = identifier.slice(1);
        element = document.getElementById(search_identifier);

        //When a mouse hovers over the specified element,
        //setTimeout to trigger in 'time' seconds.
        element.addEventListener('mouseenter', (event) => {

            let enter_time;
            let exit_time;

            enter_time = event.timeStamp; 

            element.addEventListener('mouseleave', (event) => {
                exit_time = event.timeStamp;
            });

            setTimeout(() => {

                //If mouse hasn't exited the element region
                //or if the diff between exit and enter times is >= time
                //update current_page.hover_data
                if(exit_time == null || exit_time-enter_time >= time){
                    hover_event = new Hover_Event(identifier, enter_time); 
                    current_page.hover_data.push(hover_event);
                }
            }, time);
        });
    }

    function monitor_elements_class(identifier, time){

        //Find elements by class-name
        search_identifier = identifier.slice(1);
        collection = document.getElementsByClassName(search_identifier);
        elements = Array.prototype.slice.call(collection); //Converts HTMLcollection into an Array

        elements.forEach((element) => {

            //When a mouse hovers over the specified element,
            //setTimeout to trigger in 'time' seconds.
            element.addEventListener('mouseenter', (event) => {

                let enter_time;
                let exit_time;

                enter_time = event.timeStamp;

                element.addEventListener('mouseleave', (event) => {
                    exit_time = event.timeStamp;
                });

                //If mouse hasn't exited the element region
                //or if the diff between exit and enter times is >= time
                //update current_page.hover_data
                setTimeout(() => {
                    if(exit_time == null || exit_time-enter_time >= time){
                        hover_event = new Hover_Event(identifier, enter_time); 
                        current_page.hover_data.push(hover_event);
                    }
                }, time);

            })
        })
    }

    //------------BATCH METHODS------------//

    function run_batch(){

        //Sends data every 30 seconds
        setInterval(() => {

            //1. Copy state of current_page and push into session.data
            //2. Send session to WebSocket
            //3. Clear recently posted data 
            let current_page_copy = Object.assign({}, current_page);
            session.data.push(current_page_copy);
            console.log("session "+ JSON.stringify(session));
            socket.send(JSON.stringify(format_session(session)));
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
        current_page.click_data = [];
        current_page.hover_data = [];

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

    function Page_Session(name){

        this.page_name = name;
        this.load_time = getCurrentTime();
        this.unload_time =  null;
        this.click_data = [];
        this.hover_data = [];

    }

    function Site_Session(){

        this.load_time = getCurrentTime();
        this.unload_time = null;
        this.page_sessions = [];

    }

    function Hover_Event(identifier, load_time){

        this.load_time = load_time;
        this.identifier = identifier;

    }

    function Click_Event(identifier){

        this.load_time = getCurrentTime();
        this.identifier = identifier;

    }

}

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

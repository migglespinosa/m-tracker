M-tracker requirements:
- Heatmap 
- Session length 
- Event tracking 


Open Websocket connection

Batching logic (Requests are event-driven):
    1. Element is added to the batch
        a. If push method is not locked, copy element to batch_stage
        b. Else, keep element in batch
    2. Element is added to batch_stage 
        a. If element is the only one in batch_stage, set delay for WebSocket POST request in 10 seconds
    3. At 10 seconds
        a. Lock push method
        b. Perform POST request
    4. Await response. 
        a. If successful:
            i. Clear batch_stage and intersection of batch_stage and batch
            ii. Unlock push method
        b. Else: 
            Retry logic:
            Circut breaker pattern? https://docs.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker

M-tracker requirements:
- Heatmap 
- Session length 
- Event tracking 

Two possible data structures:

- An array (or object?) called site_session
- Each element in site_session represents a page_session
- Page_session is an object with properties:
    - Position data
    - Event data
    - Load time 
    - Unload time
    - Unique ID?

Keep in mind the backend:
- Because we're ingesting analytics data, we'd use a flexible non-relational database -> MongoDB? (Document-based data)

Helpful links:
https://www.mongodb.com/nosql-explained/data-modeling
https://docs.mongodb.com/manual/core/data-model-design/

What is good DB design?
https://support.microsoft.com/en-us/office/database-design-basics-eb2159cf-1e30-401a-8084-bd4f9c9ca1f5#bmterms

Non-relational DB Design:

Collections: 
- Accounts -Site_Sessions -Page_Sessions -EventData? -PositionData?

Site_Sessions = {
    _id: unique_val,
    account: accounts._id
    load: [time],
    unload: [time],
    page_sessions: Array or Map of page_session objects //???? Don't think we need to-we can query documents in collection by field
}

//Don't think we need to have page_session-we can query documents in collection by field
//https://docs.mongodb.com/manual/reference/method/db.collection.find/

Page_Sessions = {
    _id: unique_val
    site_session: site_sessions_.ID
    event_data: 
}
M-tracker requirements:
- Heatmap 
- Session length 
- Event tracking 

Two possible data structures:

- An array (or object?) called site_session
- Each element in site_session represents a page_session
- Page_session is an object with properties:
    - Hover data
    - Event data
    - Load time 
    - Unload time
    - Unique ID?

Hover data (replacement for position data):
- User must specify:
    - id/class 
    - how long mouse has been hovering above specified element 

Keep in mind the backend:
- Because we're ingesting analytics data, we'd use a flexible non-relational database -> MongoDB? (Document-based data)

Helpful links:
https://www.mongodb.com/nosql-explained/data-modeling
https://docs.mongodb.com/manual/core/data-model-design/

What is good DB design?
https://support.microsoft.com/en-us/office/database-design-basics-eb2159cf-1e30-401a-8084-bd4f9c9ca1f5#bmterms

Non-relational DB Design:

Collections: 
- Accounts -Site_Sessions -Page_Sessions -EventData? -HoverData?

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

####### MongoDB Recommended Data Modeling Concepts #######

According to https://docs.mongodb.com/manual/core/data-modeling-introduction/:

- One-to-one, one-to-many relationships should follow embedded, non-normalized model
- Embedded model enables more efficient atomic operations
- Follow subset patterns to reduce collection size at the expense of higher maintanance costs, more difficult
"JOIN" operations, and potential data duplication
- Use reference model if the cost of data publication exceeds the benefits of performance

- Current plan:
- Use an embedded data model for Session -> Page -> HoverData
- Follow subset pattern for Sessions, where Sessions older than a day are put into a historical collection of 
- sessions
- Don't follow a subset pattern where we create a new collection for less accessed fields

- Future data object models:
    - Account settings 
    - Session reference data:
        - One pointer to data less than 10 days old
        - One pointer to data more than 10 days old

Questions to consider:
- How to automate testing?
- Which cloud provider should I use?
    


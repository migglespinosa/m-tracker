M-tracker requirements:
- Heatmap 
- Session length 
- Event tracking 

Two possible data structures:

- An array called site_session
- Each element in site_session represents a page_session
- Page_session is an object with properties:
    - Position data
    - Event data
    - Load time 
    - Exit time
    - Unique ID?
In the root directory run:

### `node server.js`

In the client directory run:

### `npm start`

Things to add:
- Further restrict buying and selling based on technical indicators. Example: disable the buy button if the price is not above the 3/8 EMA, VWAP, meeting the volume requirement. Highlight the table row blue if it does meet all these requirements. Need a selector for which time period to base all these calculations on (5min, 1Day)
- an orders table to see which orders are live, closed and cancelled?
- disable buy or sell if account size is exceeded
- add close button as well?
- close all positions (there is an Alpaca endpoint for this) when I have reached my daily dollar target

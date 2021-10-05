In the root directory run:

### `node server.js`

In the client directory run:

### `npm start`

Things to add:
- Further restrict buying and selling based on technical indicators. Example: disable the buy button if the price is not above the 3/8 EMA, VWAP, meeting the volume requirement. Highlight the table row blue if it does meet all these requirements.
- Move 'not a valid asset' error alert from search to the alert component.
- Enable the alert component to receive errors from Alpaca
- an orders table to see which orders are live, closed and cancelled?
- disable buy or sell if account size is exceeded
- add cancel order button for positions table once sell or buy order has been placed (after bracket). add close button as well?

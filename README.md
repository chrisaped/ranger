In the root directory run:

### `node server.js`

In the client directory run:

### `npm start`

Things to add:

- Further restrict buying and selling based on technical indicators. Example: disable the buy button if the price is not above the 3/8 EMA, VWAP, meeting the volume requirement. Highlight the table row blue if it does meet all these requirements. Need a selector for which time period to base all these calculations on (5min, 1Day)
- use recoil to add global state so I can have indicator data there
- add relative volume indicator?
- an orders table to see which orders are live, closed and cancelled?
- add close button as well?
- close all positions (there is an Alpaca endpoint for this) when I have reached my daily dollar target
- move calculations to server

BUG FIXES:

- cancel button is showing up next to sell button after canceling a bracket order
- EMA values are still not accurate....are there enough data points? is this only when the day starts?
- change orders to be not cancelled after the day is over (good till cancelled?)
- need to broaden date range to reflect swing trades for positions to reflect proper profit/loss. swing trading profit/loss does not show up at the moment

- new stock purchased -> create new position, create new order, create targets. create OCO order from first target, and send to Alpaca
- first target reached -> update position quantity, update first target, create new order. create OCO order from second target, and send to Alpaca
- second target reached -> update position, update second target, create new order. check remaining quantity of position, correct position and target if incorrect. create OCO order from third target, and send to Alpaca
- third target reached -> update position, update third target, create new order.

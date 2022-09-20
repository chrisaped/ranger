In the client and root directories run:

### `npm start`

In the ranger api run:

### `rails s`

Things to add:

- an orders table to see which orders are live, closed and cancelled?
- add close button as well?
- close all positions (there is an Alpaca endpoint for this) when I have reached my daily dollar target
- move calculations to server

BUG FIXES:

- EMA values are still not accurate....are there enough data points? is this only when the day starts?
- change orders to be not cancelled after the day is over (good till cancelled?)
- need to broaden date range to reflect swing trades for positions to reflect proper profit/loss. swing trading profit/loss does not show up at the moment
- if I make this into a service...if a trade is profitable, take a small percentage of that profit. if it's not profitable, take nothing.

# Ranger: A web app for executing stock trades using the Alpaca API

After using many of the popular brokers to execute my stock trades, I found that none of them provided me with an interface I enjoyed using on a daily basis. I wanted a simple interface that would allow me to enter trades based on my risk tolerance and profit-taking goals. I didn’t want charts or any other features since I use other services for that.

[Here is a video](https://www.dropbox.com/scl/fi/fi3fc6tglmezdpoxxxvge/Ranger-Demo.mp4?rlkey=7mvi3i214vqnhetl63r96rcij&dl=0) of my interface in action. I built this over the course of a few months using React, Ruby on Rails, and the Alpaca API. Entering the price in the stop and limit fields auto-calculate my position size and profit targets for the trade, whether it’s a long or short position. The next profit target is highlighted in green in the positions table, and each row is highlighted in green or red, based on whether the position is profitable or not.

My position size in trades is based on my risk tolerance, which is a fixed percentage (usually less than 1%) of my account size. I take profits by selling 1/3 of my position at 1, 2, and 3 times the initial risk level (per share) for the trade. As each profit target is filled, the stop price is also raised (by adding the risk per share) to ensure that the trade doesn’t turn into a loss.

This repository is the front-end of the app. The backend Rails API is [here](https://github.com/chrisaped/ranger_api).

In the client and root directories run:
`npm start`

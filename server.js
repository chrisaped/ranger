require('dotenv').config()

const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const alpacaDataStream = require('./AlpacaDataStream').AlpacaDataStream

app.listen(port, () => console.log(`Listening on port ${port}`))

app.post('/alpaca_data_stream', (req, res) => {
  let stream = new alpacaDataStream({
    apiKey: process.env.ALPACA_API_KEY,
    secretKey: process.env.ALPACA_API_SECRET,
    feed: "sip",
    paper: true,
  })
  console.log('it works!', stream)
  res.send({ dataStream: stream })
})

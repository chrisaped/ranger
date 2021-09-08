const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const alpacaDataStream = require('./AlpacaDataStream').AlpacaDataStream

app.listen(port, () => console.log(`Listening on port ${port}`))

app.post('/alpaca_data_stream', (req, res) => {
  console.log('here is the request', req)
  let stream = new alpacaDataStream(['GME'])
  console.log('it works!', stream)
  res.send({ dataStream: stream })
})

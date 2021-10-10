const alpaca = require('./alpaca');

module.exports = {
  calculateEMA: async function(barObj, period, alpacaInstance, io) {
    const symbol = barObj.Symbol;
    const today = new Date().toISOString().slice(0, 10); // "2021-10-07"
    const closingPricesArray = alpaca.getBars(symbol, alpacaInstance, today, today);

    tulind.indicators.ema.indicator(closingPricesArray, [period], function(err, results) {
      if (err) {
        console.log('tulind error', err);
      }
      console.log(`Result of ${period}EMA is:`, results[0]);
      io.emit(`${symbol} ${period}EMA`, results[0]);
    });
  },
  getVWAP: async function(barObj, io) {
    const symbol = barObj.Symbol;
    const VWAP = barObj.vw;
    io.emit(`${symbol} VWAP`, VWAP);
  }
};

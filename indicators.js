const tulind = require('tulind');

module.exports = {
  calculateEMA: async function(barObj, period, alpacaInstance, io, alpaca) {
    const symbol = barObj.Symbol;
    const today = new Date().toISOString().slice(0, 10); // "2021-10-07"
    const closingPricesArray = await alpaca.getBars(symbol, alpacaInstance, today, today);

    tulind.indicators.ema.indicator([closingPricesArray], [period], (err, results) => {
      if (err) {
        console.log('tulind error', err);
      }
      const result = results[0].slice(-1)[0];
      io.emit(`${symbol} ${period}EMA`, result);
    });
  },
  getVWAP: function(barObj, io) {
    const symbol = barObj.Symbol;
    const VWAP = barObj.vw;
    io.emit(`${symbol} VWAP`, VWAP);
  }
};

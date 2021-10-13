const EMA = require('technicalindicators').EMA;
const VWAP = require('technicalindicators').VWAP;

module.exports = {
  calculateIndicators: async function(barObj, alpacaInstance, io, alpaca) {
    const symbol = barObj.Symbol;
    const today = new Date().toISOString().slice(0, 10); // "2021-10-07"
    const barsData = await alpaca.getBars(symbol, alpacaInstance, today, today);

    const EMA3Result = EMA.calculate({ period: 3, values: barsData.close });
    console.log('here is the EMA3Result:', EMA3Result);
    io.emit(`${symbol} ${period}EMA`, EMA3Result);

    const EMA8Result = EMA.calculate({ period: 8, values: barsData.close });
    console.log('here is the EMA8Result:', EMA8Result);
    io.emit(`${symbol} ${period}EMA`, EMA8Result);

    const VWAPResult = VWAP.calculate(barsData);
    console.log('here is the VWAPResult', VWAPResult);
    io.emit(`${symbol} VWAP`, VWAPResult);
  }
};

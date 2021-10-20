const EMA = require('technicalindicators').EMA;
const VWAP = require('technicalindicators').VWAP;

module.exports = {
  calculateIndicators: async function(barObj, alpacaInstance, io, alpaca) {
    const symbol = barObj.Symbol;
    const today = new Date().toISOString().slice(0, 10); // "2021-10-07"
    const barsData = await alpaca.getBars(symbol, alpacaInstance, today, today);

    const EMA3Results = EMA.calculate({ period: 3, values: barsData.close });
    const EMA3Result = EMA3Results[EMA3Results.length - 1];
    io.emit(`${symbol} 3EMA`, EMA3Result);

    const EMA8Results = EMA.calculate({ period: 8, values: barsData.close });
    const EMA8Result = EMA8Results[EMA8Results.length - 1];
    io.emit(`${symbol} 8EMA`, EMA8Result);

    const VWAPResults = VWAP.calculate(barsData);
    const VWAPResult = VWAPResults[VWAPResults.length - 1];
    io.emit(`${symbol} VWAP`, VWAPResult);
  }
};

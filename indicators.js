const alpaca = require('./alpaca');
const dayjs = require('dayjs');
const dayjsBusinessDays = require('dayjs-business-days');
dayjs.extend(dayjsBusinessDays);

module.exports = {
  // calculateSMA: async function (symbol, currentPrice, alpacaInstance, io) {
  //   // 10 SMA
  //   const timePeriods = 10;
  //   const today = new Date().toISOString().slice(0, 10); // "2021-10-07"
  //   const tenBusinessDaysAgo = dayjs(today).businessDaysSubtract(timePeriods).format('YYYY-MM-DD');
  //   const barsClosingPricesArray = alpaca.getBars(symbol, alpacaInstance, tenBusinessDaysAgo, today);

  //   if (barsClosingPricesArray.length === (timePeriods - 1)) {
  //     const currentPriceArray = [currentPrice];
  //     const closingPricesArray = (await barsClosingPricesArray).concat(currentPriceArray);
  //     tulind.indicators.sma.indicator(closingPricesArray, [timePeriods], function(err, results) {
  //       if (err) {
  //         console.log('tulind error', err);
  //       }
  //       console.log('tulind SMA results', results);
  //       console.log("Result of sma is:", results[0]);
  //       io.emit(`${symbol} SMA`, results[0]);
  //     });
  //   } else {
  //     console.log('something did not work');
  //     // io emit error
  //   }
  // }
}

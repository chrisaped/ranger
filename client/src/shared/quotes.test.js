import { selectPrice } from "./quotes";

const priceObj = { ask: 1.0, bid: 1.05 };

describe("quotes", () => {
  test("buy uses the ask price", () => {
    const side = "buy";
    expect(selectPrice(priceObj, side)).toBe(priceObj.ask);
  });

  test("sell uses the bid price", () => {
    const side = "sell";
    expect(selectPrice(priceObj, side)).toBe(priceObj.bid);
  });

  test("long position uses the bid price", () => {
    const side = "long";
    expect(selectPrice(priceObj, side)).toBe(priceObj.bid);
  });

  test("short position uses the ask price", () => {
    const side = "short";
    expect(selectPrice(priceObj, side)).toBe(priceObj.ask);
  });
});

import { createBracketOrderObject } from "./orders";

describe("orders", () => {
  test("createBracketOrderObject", () => {
    const symbol = "GME";
    const side = "buy";
    const positionSize = 10;
    const profitTarget = 200;
    const stopPrice = 190;
    const limitPrice = 195;
    const orderObject = createBracketOrderObject(
      symbol,
      side,
      positionSize,
      profitTarget,
      stopPrice,
      limitPrice
    );
    expect(orderObject.symbol).toBe("GME");
  });
});

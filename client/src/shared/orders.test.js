import {
  createBracketOrderObject,
  extractTotalProfitLossFromClosedOrders,
} from "./orders";
import { orders } from "../dataSamples/orders";

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

  test("get profitLoss from closed orders", () => {
    const closedPositionsProfitLoss =
      extractTotalProfitLossFromClosedOrders(orders);
    expect(closedPositionsProfitLoss).toBe(-29.35);
  });
});

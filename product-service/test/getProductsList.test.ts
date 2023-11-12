import { productsListHandler } from "../lambda/getProductsList";
import { products } from "../mocks/data";
import { event, context } from "./test-mocks";

describe("getProductsList handler", () => {
  test("returns a 200 status code", async () => {
    const response = await productsListHandler(event, context, () => {});
    expect(response.statusCode).toBe(200);
  });

  test("returns the products array as JSON", async () => {
    const response = await productsListHandler(event, context, () => {});
    expect(JSON.parse(response.body)).toEqual(products);
  });
});

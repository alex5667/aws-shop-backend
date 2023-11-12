import { productsIdHandler } from "../lambda/getProductsById";
import { products } from "../mocks/data";
import { context, createEvent } from "./test-mocks";

describe("getProductsById handler", () => {
  test("returns the product data as JSON for an existing product", async () => {
    const id = products[0].id;
    const event = createEvent(id);
    const response = await productsIdHandler(event, context, () => {});
    expect(JSON.parse(response.body!)).toEqual(products[0]);
  });

  test("returns a 404 status code for a non-existing product", async () => {
    const event = createEvent("custom-id");
    const response = await productsIdHandler(event, context, () => {});
    expect(response.statusCode).toBe(404);
  });
});

import { Handler } from "aws-lambda";
import { buildResponse } from "./utils";

import { createProductTransaction } from "../db/rds_utils";
import { IProduct, ICreatedProduct, IStock } from "../db/types";
import { v4 as uuidv4 } from "uuid";

export const createProductHandler: Handler = async (event) => {
  console.log("createProductHandler", event);

  try {
    if (event.body) {
      const body: ICreatedProduct = JSON.parse(event.body);
      const { description, title, price, count } = body;
      if (
        !title ||
        !description ||
        typeof price !== "number" ||
        isNaN(Number(price)) ||
        typeof count !== "number" ||
        isNaN(Number(count))
      ) {
        return buildResponse(404, "Invalid parameters");
      }

      const id = uuidv4();
      const product: IProduct = { description, id, title, price };
      const stock: IStock = { product_id: id, count };

      await createProductTransaction(product, stock);

      return buildResponse(404, {
        message: { id, description, title, price, count },
      });
    }
    return buildResponse(400, "Missing required body");
  } catch (err: any) {
    return buildResponse(400, `Error creating product: ${err.message}`);
  }
};

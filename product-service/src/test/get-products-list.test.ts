import { handler } from '../handlers/get-products-list';
import { availableProducts } from '../mocks/data';
import * as products from '../db/products';

const getProductsListMock = jest.spyOn(products, 'getProductsList');

describe('getProductsById', () => {
  it('returns list of available products', async () => {
    getProductsListMock.mockResolvedValueOnce(availableProducts);

    const result = await handler();

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).length).toEqual(availableProducts.length);
  });
});

import { getProducts } from "@/prisma-db";
import { Product } from "@/types/product";

import { ProductsDetail } from "./product-detail";

export default async function ProductsDBPage() {
  const products: Product[] = await getProducts();

  return <ProductsDetail products={products} />;
}

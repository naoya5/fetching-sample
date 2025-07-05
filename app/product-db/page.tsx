import { getProducts } from "@/prisma-db";
import { Product } from "@/types/product";
import Link from "next/link";

export default async function ProductsDBPage() {
  const products: Product[] = await getProducts();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">商品データベース</h1>
      <Link
        href="/product-db-create"
        className="bg-blue-500 text-white rounded-md mb-4"
      >
        Create Product
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">
              <Link href={`/product-db/${product.id}`}>{product.title}</Link>
            </h2>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-lg font-bold text-blue-600">
              ¥{product.price.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

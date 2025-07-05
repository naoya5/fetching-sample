"use client";

import { deleteProductAction } from "@/actions/product";

import { Product } from "@/types/product";
import Link from "next/link";
import { useOptimistic } from "react";

export function ProductsDetail({ products }: { products: Product[] }) {
  //optimistic hook
  const [optimisticProducts, setOptimisticProducts] = useOptimistic(
    products,
    (current, productId) => {
      return current.filter((product) => product.id !== productId);
    }
  );

  //delete product
  const deleteProduct = async (productId: number) => {
    setOptimisticProducts(productId);
    await deleteProductAction(productId);
  };

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
        {optimisticProducts.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">
              <Link href={`/product-db/${product.id}`}>{product.title}</Link>
            </h2>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-lg font-bold text-blue-600">
              ¥{product.price.toLocaleString()}
            </p>
            <div className="flex gap-2 justify-end">
              <Link
                href={`/product-db/${product.id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded-md mb-2 inline-block text-center"
              >
                Edit
              </Link>
              <form action={deleteProduct.bind(null, product.id)}>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-400 text-white rounded-md mb-2"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

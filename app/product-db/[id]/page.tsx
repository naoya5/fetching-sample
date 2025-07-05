import { getProduct } from "@/prisma-db";
import EditProductForm from "./product-edit-form";
import { Product } from "@/types/product";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  //get id
  const { id } = await params;

  //get product by id
  const product: Product | null = await getProduct(parseInt(id));

  //if product is not found, return 404
  if (!product) {
    return notFound();
  }

  return <EditProductForm product={product} />;
}

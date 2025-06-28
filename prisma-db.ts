import { PrismaClient } from "./app/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const seedProducts = async () => {
  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.createMany({
      data: [
        {
          title: "Product 1",
          price: 100,
          description: "Description 1",
        },
        {
          title: "Product 2",
          price: 200,
          description: "Description 2",
        },
        {
          title: "Product 3",
          price: 300,
          description: "Description 3",
        },
        {
          title: "Product 4",
          price: 400,
          description: "Description 4",
        },
      ],
    });
  }
};

seedProducts();

//get all products
export async function getProducts() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return await prisma.product.findMany();
}

//get a single product
export async function getProduct(id: number) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return await prisma.product.findUnique({
    where: { id },
  });
}

//create a product
export async function createProduct(
  title: string,
  price: number,
  description: string
) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return await prisma.product.create({
    data: { title, price, description },
  });
}

//update a product
export async function updateProduct(
  id: number,
  title: string,
  price: number,
  description: string
) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return await prisma.product.update({
    where: { id },
    data: { title, price, description },
  });
}

//delete a product
export async function deleteProduct(id: number) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return await prisma.product.delete({
    where: { id },
  });
}

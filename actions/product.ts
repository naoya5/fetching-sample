"use server";

import { createProduct } from "@/prisma-db";
import { redirect } from "next/navigation";

export type Errors = {
  title?: string;
  price?: string;
  description?: string;
};
export type FormState = {
  errors: Errors;
};

//action
export async function createProductAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const title = formData.get("title") as string;
  const price = formData.get("price") as string;
  const description = formData.get("description") as string;

  const errors: Errors = {};

  if (!title) {
    errors.title = "title is requiered";
  }

  if (!price) {
    errors.price = "price is requiered";
  }

  if (!description) {
    errors.description = "description is requiered";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  //backend function
  await createProduct(title, parseInt(price), description);
  redirect("/product-db");
}

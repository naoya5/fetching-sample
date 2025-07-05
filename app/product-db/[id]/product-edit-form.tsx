"use client";

import { SubmitButton } from "@/components/submit";
import { useActionState } from "react";
import { editProductAction, FormState } from "@/actions/product";
import { Product } from "@/types/product";

export default function EditProductForm({ product }: { product: Product }) {
  //initial state
  const initialState: FormState = {
    errors: {},
  };

  //bind the id to the editProductAction
  const editProductWithId = (prevState: FormState, formData: FormData) =>
    editProductAction(prevState, formData, product.id);
  //state
  const [state, formAction, isPending] = useActionState(
    editProductWithId,
    initialState
  );

  return (
    <form action={formAction} className="p-4 space-y-4 max-w-96">
      <label htmlFor="title" className="text-bold">
        Title
        <input
          type="text"
          name="title"
          className="block w-full p-2 text-black border border-gray-300 rounded-md"
          defaultValue={product.title}
        />
      </label>
      {state.errors.title && (
        <p className="text-red-500">{state.errors.title}</p>
      )}
      <label htmlFor="price" className="text-bold">
        Price
        <input
          type="number"
          name="price"
          className="block w-full p-2 text-black border border-gray-300 rounded-md"
          defaultValue={product.price}
        />
      </label>
      {state.errors.price && (
        <p className="text-red-500">{state.errors.price}</p>
      )}
      <label htmlFor="description" className="text-bold">
        Description
        <input
          type="text"
          name="description"
          className="block w-full p-2 text-black border border-gray-300 rounded-md"
          defaultValue={product.description ?? ""}
        />
      </label>
      {state.errors.description && (
        <p className="text-red-500">{state.errors.description}</p>
      )}
      <div className="flex justify-end mt-4">
        <SubmitButton isPending={isPending} />
      </div>
    </form>
  );
}

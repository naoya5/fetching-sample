import { SubmitButton } from "@/components/submit";
import { createProduct } from "../../prisma-db";
import { redirect } from "next/navigation";

export default function AddProductPage() {
  //action
  async function createProductAction(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;

    if (!title || !price || !description) {
      throw new Error("All fields are required");
    }

    //backend function
    await createProduct(title, parseInt(price), description);
    redirect("/product-db");
  }

  return (
    <form action={createProductAction} className="p-4 space-y-4 max-w-96">
      <label htmlFor="title" className="text-bold">
        Title
        <input
          type="text"
          name="title"
          className="block w-full p-2 text-black border border-gray-300 rounded-md"
        />
      </label>
      <label htmlFor="price" className="text-bold">
        Price
        <input
          type="number"
          name="price"
          className="block w-full p-2 text-black border border-gray-300 rounded-md"
        />
      </label>
      <label htmlFor="description" className="text-bold">
        Description
        <input
          type="text"
          name="description"
          className="block w-full p-2 text-black border border-gray-300 rounded-md"
        />
      </label>
      <div className="flex justify-end mt-4">
        <SubmitButton />
      </div>
    </form>
  );
}

"use client";
import { useFormStatus } from "react-dom";

export const SubmitButton = ({ isPending }: { isPending: boolean }) => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || isPending}
      className="block w-full bg-blue-500 rounded disabled:bg-gray-500"
    >
      Submit
    </button>
  );
};

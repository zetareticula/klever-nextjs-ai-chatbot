"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthForm } from "@/components/custom/auth-form";
import { SubmitButton } from "@/components/custom/submit-button";

import { register, RegisterActionState } from "../actions";


// Register page
// The register page is used to create new user accounts.
// It is used to authenticate users. It is also used to create new user accounts.
export default function Page() {

  // The useRouter hook is used to access the router object.
  const router = useRouter();

  // The setEmail state is used to store the email address.
  const [email, setEmail] = useState("");
  // The useActionState hook is used to manage the form state.
  // It provides methods for submitting the form and handling the form lifecycle.
  // The register action is used to create new user accounts. 
  // The RegisterActionState is the form state.
  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: "idle",
    },
  );

  // The useEffect hook is used to handle the form state.
  // It provides methods for submitting the form and handling the form lifecycle.
  useEffect(() => {
    // The toast.error method is used to display an error message.
    if (state.status === "user_exists") {
      toast.error("Account already exists");
    } else if (state.status === "failed") {
      toast.error("Failed to create account");
    } else if (state.status === "invalid_data") {
      toast.error("Failed validating your submission!");
    } else if (state.status === "success") {
      toast.success("Account created successfully");
      router.refresh();
    }
  }, [state, router]);

  // The handleSubmit function is used to handle the form submission.
  // setEmail is used to store the email address.
  // formAction is used to submit the form.
  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  // The return statement is used to render the register page.
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign Up</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create an account with your email and password
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton>Sign Up</SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"Already have an account? "}
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign in
            </Link>
            {" instead."}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}

"use server";

import { z } from "zod";

import { createUser, getUser } from "@/db/queries"; //import the createUser and getUser functions from the db/queries module

import { signIn } from "./auth";


// The authFormSchema is used to validate the form data.
// It is used to validate the email and password fields.
const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// The LoginActionState is used to manage the login form state.
export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
}

// The login function is used to authenticate users.
//it is an async function that takes the LoginActionState and FormData as arguments.
//It returns a Promise of LoginActionState.
// the promise is used to handle the login form state.
export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    //signin
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

// The RegisterActionState is used to manage the register form state.
// It is used to handle the register form state.
// Idle is the initial state of the register form.
// In progress is the state when the register form is being submitted.
// Success is the state when the register form is successfully submitted.
// Failed is the state when the register form submission fails.
// User exists is the state when the user already exists.
// Invalid data is the state when the form data is invalid.
export interface RegisterActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
}

// The register function is used to create new user accounts.
export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    let [user] = await getUser(validatedData.email);

    if (user) {
      return { status: "user_exists" } as RegisterActionState;
    } else {
      await createUser(validatedData.email, validatedData.password);
      await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      return { status: "success" };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

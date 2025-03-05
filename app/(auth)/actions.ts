"use server";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { createUser, getUser } from "@/db/queries";

export type ActionStatus = 
  | "idle" 
  | "in_progress" 
  | "success" 
  | "failed" 
  | "invalid_data";

export type RegisterStatus = ActionStatus | "user_exists";

export interface ActionState {
  status: ActionStatus;
  message?: string;
}

export interface RegisterActionState {
  status: RegisterStatus;
  message?: string;
}

const authFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const validateFormData = (formData: FormData) => {
  return authFormSchema.parse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
};

export async function login(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const validatedData = validateFormData(formData);

    const result = await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    if (!result?.ok) {
      return { 
        status: "failed",
        message: "Invalid credentials" 
      };
    }

    return { 
      status: "success",
      message: "Successfully logged in" 
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        status: "invalid_data",
        message: error.errors[0]?.message || "Invalid form data"
      };
    }

    return { 
      status: "failed",
      message: error instanceof Error ? error.message : "Login failed"
    };
  }
}

export async function register(
  prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  try {
    const validatedData = validateFormData(formData);

    const [existingUser] = await getUser(validatedData.email);

    if (existingUser) {
      return { 
        status: "user_exists",
        message: "An account with this email already exists" 
      };
    }

    await createUser(validatedData.email, validatedData.password);

    const signInResult = await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    if (!signInResult?.ok) {
      return { 
        status: "failed",
        message: "Account created but failed to sign in" 
      };
    }

    return { 
      status: "success",
      message: "Account created successfully" 
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        status: "invalid_data",
        message: error.errors[0]?.message || "Invalid form data"
      };
    }

    return { 
        status: "failed",
        message: error instanceof Error ? error.message : "Registration failed"
    };
  }
}
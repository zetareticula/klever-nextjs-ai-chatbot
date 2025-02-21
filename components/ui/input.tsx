import React from "react";
import { cn } from "@/lib/utils";

//InputProps is an interface that extends the React.InputHTMLAttributes interface.
//It is used to define the props for the Input component.
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}


  // Input component
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  // The input component is a simple wrapper around the native input element.
  //className: string, type: string, props: any, ref: any
  //We envision a JSON object with the following properties: className, type, props, and ref.
  ({ className, type = "text", ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";

export { Input };
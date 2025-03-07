import Link from "next/link";
import { getServerSession } from "next-auth/next"; 
import { signOut } from "next-auth/react";

import { History } from "./history";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const Navbar = async () => {
  const session = await getServerSession();

  return (
    <div className="bg-background absolute top-0 left-0 w-full py-2 px-3 flex justify-between items-center z-30">
      <div className="flex items-center gap-3">
        <History user={session?.user} />
        <span className="text-sm dark:text-zinc-300">Next.js Chatbot</span>
      </div>

      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="py-1.5 px-2 h-fit font-normal" variant="secondary">
              {session.user?.email}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <ThemeToggle />
            </DropdownMenuItem>
            <DropdownMenuItem className="p-1 z-50">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left px-1 py-0.5 text-red-500"
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button className="py-1.5 px-2 h-fit font-normal" asChild>
          <Link href="/login">Login</Link>
        </Button>
      )}
    </div>
  );
};
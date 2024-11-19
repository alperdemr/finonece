"use client";

import { useSession, signOut } from "next-auth/react";
import { Loader, LogOut,User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UserButton = () => {
  const session = useSession();
  if (session.status === "loading") {
    return <Loader className=" size-4 animate-spin text-muted-foreground" />;
  }
  if (session.status === "unauthenticated" || !session.data) {
    return null;
  }
  const name = session.data?.user?.name!;
  const imageUrl = session.data?.user?.image;
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className=" relative outline-none">
        <Avatar className=" hover:opacity-75 size-10 transition">
          <AvatarImage alt={name} src={imageUrl || ""} />
          <AvatarFallback className="flex items-center justify-center bg-blue-500 font-medium text-white">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem className="h-10 ">
            <User className=" mr-2 size-4" />
            Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="h-10" onClick={() => signOut()}>
          <LogOut className=" mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;

import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const UserButton = () => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="hover:bg-white/20 bg-white/10 border-none outline-none transition focus-visible:ring-offset-0 focus:visible:ring-transparent"
    >
      <User className=" size-4" color="white" />
    </Button>
  );
};

export default UserButton;

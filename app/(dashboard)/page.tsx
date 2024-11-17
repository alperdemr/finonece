"use client";

import { Button } from "@/components/ui/button";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";

const Home = () => {
  const { onOpen } = useNewAccount();

  return (
    <div>
      <Button onClick={onOpen}>Add an Account</Button>
    </div>
  );
};

export default Home;

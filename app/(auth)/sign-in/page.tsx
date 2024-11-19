import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignInCard from "@/features/auth/components/sign-in-card";

const SignIn = async () => {
  const session = await auth();
  if (session) {
    redirect("/");
  }
  return (
    <div className=" flex items-center justify-center h-screen">
      <SignInCard />
    </div>
  );
};

export default SignIn;

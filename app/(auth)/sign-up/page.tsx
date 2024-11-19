import { redirect } from "next/navigation";
import SignUpCard from "@/features/auth/components/sign-up-card";
import { auth } from "@/auth";

const SignUpPage = async () => {
  const session = await auth();
  if (session) {
    redirect("/");
  }
  return (
    <div className=" flex items-center justify-center h-screen">
      <SignUpCard />
    </div>
  );
};

export default SignUpPage;

import HeaderLogo from "@/components/header-logo";
import Navigation from "@/components/navigation";
import UserButton from "@/features/auth/components/user-button";
import WelcomeMessage from "@/components/welcome-message";

const Header = () => {
  return (
    <header className="bg-gradient-to-b from-blue-700 to-blue-500 px-4 py-8 lg:px-14 pb-36">
      <div className=" max-w-screen-2xl mx-auto">
        <div className="  flex items-center justify-between mb-14 ">
          <div className=" flex items-center lg:gap-x-16">
            <HeaderLogo />
            <Navigation />
          </div>
          <UserButton />
        </div>
        <WelcomeMessage />
      </div>
    </header>
  );
};

export default Header;

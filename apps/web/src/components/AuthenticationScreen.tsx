import { FC, ReactElement } from "react";

interface AuthenticationScreenProps {
  title: string;
  children: ReactElement[];
}

const AuthenticationScreen: FC<AuthenticationScreenProps> = ({
  title,
  children,
}) => {
  return (
    <div className="">
      <h1 className="text-black text-xl font-bold text-center my-auto">
        {title}
      </h1>
      {children}
    </div>
  );
};

export default AuthenticationScreen;

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="mx-auto min-h-screen flex items-center justify-center bg-indigo-600">
      <SignIn />
    </div>
  );
}

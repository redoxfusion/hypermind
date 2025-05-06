import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="mx-auto min-h-screen flex items-center justify-center bg-indigo-600">
      <SignUp />
    </div>
  );
}

import { getSession } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Please sign in to continue</p>
        </div>
        <div className="mt-8">
          <Button
            className="w-full"
            asChild
          >
            <a href="/api/auth/login">Sign In with Auth0</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
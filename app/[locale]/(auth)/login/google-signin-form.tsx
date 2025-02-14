// app/[locale]/(auth)/login/google-signin-form.tsx

"use client";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { SignWithGoogle } from "@/lib/actions/user.actions";

export function GoogleSignInForm() {
  const SignInButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button disabled={pending} className="w-full" variant={"outline"}>
        {pending ? "Redirecting to Google..." : "Sign In with Google"}
      </Button>
    );
  };

  return (
    <form action={SignWithGoogle}>
      <SignInButton />
    </form>
  );
}

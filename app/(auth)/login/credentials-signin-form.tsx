// app/(auth)/login/credentials-signin-form.tsx

"use client";

import { IUserSignIn } from "@/types";
import { redirect, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSignInSchema } from "@/lib/user-validator";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { toast } from "@/hooks/use-toast";
import { signInWithCredentials } from "@/lib/actions/user.actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { clog } from "@/lib/jlogger";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/app.config";
import Link from "next/link";

// 개발 환경에서는 이메일 주소와 비밀번호를 미리 채워둔다.
const signInDefaultValues =
  process.env.NODE_ENV === "development" ? { email: "jacob@miniu.kr", password: "" } : { email: "", password: "" };

export default function CredentialsSignInForm() {
  // (1). 클라이언트 컴포넌트에서 searchParams 훅을 사용하여 쿼리 파라미터를 가져온다.
  const searchParams = useSearchParams();
  // (2). 로그인 후 사용자가 이동할 경로를 가져온다. 없다면 기본값을 설정한다.
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // (3). useForm 을 사용하여 폼을 만들고 초기화한다.
  const form = useForm<IUserSignIn>({
    resolver: zodResolver(UserSignInSchema),
    defaultValues: signInDefaultValues,
  });

  // (4). form 에서 handleSubmit 과 control 을 꺼내온다.
  const { control, handleSubmit } = form;

  // (5). 로그인 폼 제출 시 실행할 onSubmit 함수를 만들어준다.
  const onSubmit = async (data: IUserSignIn) => {
    try {
      // 로그인 서버 액션 호출
      await signInWithCredentials({
        email: data.email,
        password: data.password,
      });
      clog.info("[CredentialsSignInForm] onSubmit", data);

      // 로그인 성공 후 callbackUrl로 리다이렉션한다.
      redirect(callbackUrl);
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
      // toast 에러를 띄운다.
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="space-y-6">
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Button type="submit">Sign In</Button>
          </div>
          <div className="text-sm">
            By signing in, you agree to {config.APP_NAME}&apos;s <Link href={"/page/conditions-of-use"}>Conditions of Use</Link> and{" "}
            <Link href={"/page/privacy-policy"}>Privacy Notice.</Link>
          </div>
        </div>
      </form>
    </Form>
  );
}

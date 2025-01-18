// app/(auth)/register/register-form.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { registerUser, signInWithCredentials } from "@/lib/actions/user.actions";
import { config } from "@/lib/app.config";
import { UserSignUpSchema } from "@/lib/user-validator";
import { IUserSignUp } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

// (1). 회원가입을 하기 전에 미리 기본값을 입력해 놓는다.
const signUpDefaultValues =
  process.env.NODE_ENV === "development"
    ? {
        // (a). 테스트 회원가입 회원 기본값
        name: "Jacob CH",
        email: "jacob1@miniu.kr",
        password: "",
        confirmPassword: "",
      }
    : {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      };

export default function RegisterForm() {
  // (1). 클라이언트 컴포넌트에서 searchParams 훅을 사용하여 쿼리 파라미터를 가져온다.
  const searchParams = useSearchParams();

  // (2). 회원가입 후 사용자가 이동할 경로를 설정한다. 없다면 "/"로 설정한다.
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // (3). useForm 설정
  const form = useForm<IUserSignUp>({
    resolver: zodResolver(UserSignUpSchema),
    defaultValues: signUpDefaultValues,
  });

  // (4). form 에서 control과 handleSubmit을 가져온다. onSubmit 함수를 설정한다.
  const { control, handleSubmit } = form;

  // (5). onSubmit 함수 설정
  const onSubmit = async (data: IUserSignUp) => {
    try {
      // (a). 회원가입 서버 액션을 호출한다.
      const response = await registerUser(data);

      // (b). 회원가입 결과가 성공이 아니면 에러를 발생시킨다.
      if (!response.success) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      // (c). 회원가입 성공 후 로그인한다.
      await signInWithCredentials({
        email: data.email,
        password: data.password,
      });

      // (d). 로그인 성공 후 callbackUrl로 리다이렉트한다.
      redirect(callbackUrl);
    } catch (error) {
      if (isRedirectError(error)) throw error;
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  // (6). 회원가입 폼을 랜더링한다.
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="space-y-2">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  <Input type="password" placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Button type="submit">Sign Up</Button>
          </div>
          <div className="text-sm">
            By creating an account, you agree to {config.APP_NAME}&apos;s <Link href={"/page/conditions-of-use"}>Conditions of Use</Link>{" "}
            and <Link href={"/page/privacy-policy"}>Privacy Notice.</Link>
          </div>
          <Separator className="mb-2" />
          <div className="text-sm">
            Already have an account? <Link href={`/login?callbackUrl=${callbackUrl}`}>Sign In</Link>
          </div>
        </div>
      </form>
    </Form>
  );
}

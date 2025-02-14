// app/[locale]/(root)/account/manage/name/profile-form.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateUserName } from "@/lib/actions/user.actions";
import { UserNameSchema } from "@/lib/user-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const ProfileForm = () => {
  // 1). data를 session으로 이름을 변경하고 업데이트도 가져온다. (useForm의 기본값 설정 및 이름 변경 시 사용)
  const { data: session, update } = useSession();

  // 페이지 이동을 위한 useRouter
  const router = useRouter();

  // 2). useForm을 사용하여 form 객체를 생성한다.
  // - 검사기(resolver)로 zodResolver를 사용하고, 기본값을 설정한다.
  const form = useForm<z.infer<typeof UserNameSchema>>({
    resolver: zodResolver(UserNameSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
    },
  });

  // 3). onSubmit 함수를 생성한다.
  async function onSubmit(values: z.infer<typeof UserNameSchema>) {
    // 사용자 이름을 업데이트하는 서버액션을 호출하고 결과를 저장한다.

    // Optional: 이름이 변경되지 않았다면 요청을 보내지 않고 토스트 팝업 생성
    if (values.name === session?.user?.name) {
      return toast({
        variant: "destructive",
        description: "Please enter a different name to update.",
      });
    }

    const res = await updateUserName(values);
    // 응답이 성공이 아니면 토스트 메시지 표시
    if (!res.success) {
      return toast({
        variant: "destructive",
        description: res.message,
      });
    }

    // 응답이 성공이니 응답에서 data와 message를 가져온다.
    const { data, message } = res;
    // 세션을 업데이트하고 토스트 메시지를 표시한다.
    const newUser = {
      ...session, // data는 기존 세션 정보이다.
      user: {
        ...session?.user, // user는 기존 세션의 user 정보이다.
        name: data.name, // 이름을 업데이트한다.
      },
    };

    // newUser로 세션을 업데이트한다.
    await update(newUser);
    // 토스트 메시지를 표시한다.
    toast({
      description: message,
    });
    // 페이지 이동
    router.push("/account/manage");
  }

  // 토스트 팝업
  const { toast } = useToast();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-5">
        <div className="flex items-center justify-between gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1 min-h-[48px] flex flex-col justify-center max-w-[200px] ">
                <FormLabel className="font-bold">New Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} className="input-field" />
                </FormControl>
              </FormItem>
            )}
          />

          {/* 수정 버튼 */}
          <Button type="submit" className=" button col-span-2 w-32 min-h-[40px] mt-5" disabled={form.formState.isSubmitting} size="sm">
            {form.formState.isSubmitting ? "Submitting..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

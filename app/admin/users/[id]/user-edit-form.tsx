// app/admin/users/[id]/user-edit-form.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateUser } from "@/lib/actions/user.actions";
import { USER_ROLES } from "@/lib/constants";
import { IUser } from "@/lib/db/models/user.model";
import { UserUpdateSchema } from "@/lib/user-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

// 상위 컴포넌트에서 <UserEditForm user={user} /> 폼을 호출하며 user 객체를 전달한다.
// 이를 Props로 받아서 사용한다.

const UserEditForm = ({ user }: { user: IUser }) => {
  const router = useRouter();
  const { toast } = useToast();

  // useForm
  const form = useForm<z.infer<typeof UserUpdateSchema>>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: user, // user 객체를 기본값으로 설정하여 화면에 보여준다. (수정 전 값)
  });

  const onSubmit = async (values: z.infer<typeof UserUpdateSchema>) => {
    try {
      // 사용자 정보 업데이트(서버 액션 - updateUser)
      const res = await updateUser({ ...values, _id: user._id });
      if (!res.success) {
        return toast({
          variant: "destructive",
          description: res.message,
        });
      }

      // 사용자 정보 업데이트 성공
      toast({ description: "User updated successfully. For DEMO, only owner can change user information" });
      // 폼을 리셋하고 상위 페이지로 이동한다.
      // form.reset();
      router.push("/admin/users");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
  };

  // clog.info("[UserEditForm] user", user);
  return (
    <Form {...form}>
      <form method="post" className="space-y-8 max-w-xl" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* EMAIL */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          {/* ROLE */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="flex space-x-4 items-center">
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger className="w-full md:max-w-xl">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full md:max-w-xl">
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role} disabled={role === "owner"}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* BUTTONS */}
        <div className="flex-between">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Submitting..." : "Update User "}
          </Button>
          <Button variant={"outline"} type="button" onClick={() => router.push("/admin/users")}>
            Back
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserEditForm;

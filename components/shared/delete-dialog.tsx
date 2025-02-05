// components/shared/delete-dialog.tsx

"use client";

import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

export default function DeleteDialog({
  id, // 삭제할 아이템의 ID
  action, // 삭제 시 호출할 액션
  callbackAction, // 삭제 후 호출할 액션
}: {
  id: string;
  // id를 인자로 받고 { success: true/false, message: string }을 반환한다.
  action: (id: string) => Promise<{ success: boolean; message: string }>;
  callbackAction?: () => void; // 선택적으로 삭제 후 호출할 액션
}) {
  // 다이어로그 상태 관리
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  // 토스트 팝업
  const { toast } = useToast();

  // 삭제 버튼 다이어로그
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size={"sm"} variant={"outline"}>
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button size={"sm"} variant={"outline"} asChild>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </Button>
          <Button
            variant={"destructive"}
            size={"sm"}
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                // 파라미터로 받은 액션을 id와 함께 호출하여 결과를 받는다.
                const res = await action(id);
                // 파라미터 action을 정의할 때 반환값을 Promise<{ success: boolean; message: string }>으로 정의했기 때문에 res.success로 성공 여부를 확인할 수 있다.
                if (!res.success) {
                  toast({
                    variant: "destructive",
                    description: res.message,
                  });
                } else {
                  setOpen(false);
                  toast({
                    description: res.message,
                  });

                  // 선택적으로 콜백 액션이 있다면 호출한다.
                  if (callbackAction) callbackAction();
                }
              })
            }>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

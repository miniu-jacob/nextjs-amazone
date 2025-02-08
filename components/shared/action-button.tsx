// components/shared/action-button.tsx

"use client";

import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function ActionButton({
  caption, // 버튼에 표시할 텍스트
  action, // 클릭 시 실행할 함수
  className = "w-full", // 버튼의 클래스, 기본값은 w-full
  variant = "default", // 버튼의 스타일, 기본값은 default
  size = "default", // 버튼의 크기, 기본값은 default
}: {
  caption: string;
  action: () => Promise<{ success: boolean; message: string }>;
  className?: string;
  variant?: "default" | "outline" | "destructive";
  size?: "default" | "sm" | "lg";
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  return (
    <Button
      type="button"
      className={cn("rounded-full", className)}
      variant={variant}
      size={size}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const res = await action();

          if (!res.success) {
            toast({ variant: "destructive", description: res.message });
          } else {
            toast({
              description: "Action completed",
            });
          }
        });
      }}>
      {isPending ? "processing..." : caption}
    </Button>
  );
}

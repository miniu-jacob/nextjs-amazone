// app/api/uploadthing/core.ts

// 1). 기본 설정을 초기화한다. createUploadthing() 함수를 호출하여 초기화한다.
// - createUploadthing 함수는 uploadthing/next 라이브러리에서 제공하는 함수이다.
// - 따라서 함수를 가져온다.
import { auth } from "@/lib/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// 2). 파일 업로드를 위한 라우터를 정의한다.
export const ourFileRouter = {
  // 3). 이미지 업로더를 정의한다. 초기화한 f 객체를 사용한다.
  imageUploader: f({ image: { maxFileSize: "4MB" } }) // 4MB 이하 이미지만 업로드 가능
    .middleware(async () => {
      // 4). 사용자 인증을 확인한다.
      const session = await auth();
      if (!session) throw new UploadThingError("Unauthorized");

      // 5). 업로드한 사용자의 아이디를 반환한다.
      return { userId: session?.user?.id }; // 업로드한 사용자의 아이디를 반환
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .onUploadComplete(async ({ metadata, file }) => {
      // 6). 파일 업로드가 완료되면 호출되는 함수를 정의한다.
      return { uploadBy: metadata.userId }; // 업로드한 사용자의 아이디를 반환
    }),
} satisfies FileRouter;

// 7). 라우터의 타입을 내보낸다.
export type OurFileRouter = typeof ourFileRouter;

// lib/uploadthing.ts

import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
// 업로드 설정을 가져와 타입을 적용한다.
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// 파일 업로드 버튼을 생성한다.
export const UploadButton = generateUploadButton<OurFileRouter>();

// 파일 업로드 드롭존을 생성한다.
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

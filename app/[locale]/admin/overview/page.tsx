// app/[locale]/admin/overview/page.tsx

import { auth } from "@/lib/auth";
import { Metadata } from "next";
import OverviewReport from "./overview-report";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const DashboardPage = async () => {
  // 허용된 유저 권한
  const allowedRoles = ["admin", "owner"];

  const session = await auth();

  if (!session) throw new Error("Authentication required");

  // if (session?.user.role !== "admin") throw new Error("Admin permission required");
  if (!allowedRoles.includes(session?.user.role)) throw new Error("Admin permission required");

  return <OverviewReport />;
};

export default DashboardPage;

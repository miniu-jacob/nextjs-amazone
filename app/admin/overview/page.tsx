// app/admin/overview/page.tsx

import { auth } from "@/lib/auth";
import { Metadata } from "next";
import OverviewReport from "./overview-report";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const DashboardPage = async () => {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("Admin permission required");

  return <OverviewReport />;
};

export default DashboardPage;

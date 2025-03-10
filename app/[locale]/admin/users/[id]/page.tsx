// app/[locale]/admin/users/[id]/page.tsx

import { getUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import UserEditForm from "./user-edit-form";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Edit User",
};

export default async function UserEditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const t = await getTranslations();

  const user = await getUserById(id);
  if (!user) notFound();

  return (
    <main className="max-w-6xl mx-auto p-4">
      {/* NAVIGATION LINK */}
      <div className="flex mb-4 text-sm">
        <Link href={"/admin/users"}>{t("Admin.Users")}</Link>
        <span className="mx-1">{" > "}</span>
        <Link href={`/admin/users/${user._id}`}>{user._id}</Link>
      </div>

      {/* MAIN FORM */}
      <div className="my-8">
        <UserEditForm user={user} />
      </div>
    </main>
  );
}

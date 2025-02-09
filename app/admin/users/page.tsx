// app/admin/users/page.tsx

import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteUser, getAllUsers } from "@/lib/actions/user.actions";
import { auth } from "@/lib/auth";
import { IUser } from "@/lib/db/models/user.model";
import { formatId } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Users",
};

export default async function AdminUser(props: { searchParams: Promise<{ page: number }> }) {
  const searchParams = await props.searchParams;

  // Admin Check
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("Admin permission required");

  // current page
  const page = Number(searchParams.page) || 1;

  // Get all users
  const users = await getAllUsers({ page });

  return (
    <div className="space-y-2 p-2">
      <h1 className="h1-bold">Users</h1>
      <div className="flex flex-col gap-4">
        <Table>
          {/* TABLE HEADER */}
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          {/* TABLE BODY */}
          <TableBody>
            {users.data.map((user: IUser) => (
              <TableRow key={user._id}>
                <TableCell>{formatId(user._id)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant={"outline"} size={"sm"}>
                    <Link href={`/admin/users/${user._id}`}>Edit</Link>
                  </Button>
                  <DeleteDialog id={user._id} action={deleteUser} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <div className="flex items-center justify-center">
          {users?.totalPages > 1 && <Pagination page={page} totalPages={users.totalPages} />}
        </div>
      </div>
    </div>
  );
}

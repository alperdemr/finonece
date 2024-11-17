"use client";
import { Plus } from "lucide-react";

import { useNewAccount } from "@/features/accounts/hooks/use-new-account";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";

import { columns, Payment } from "./columns";


const data: Payment[] = [
  {
    id: "628ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "528ed52f",
    amount: 200,
    status: "processing",
    email: "a@example.com",
  },
  {
    id: "428ed52f",
    amount: 300,
    status: "success",
    email: "b@example.com",
  },
];

const AccountsPage = () => {
  const newAccount = useNewAccount();
  return (
    <div className=" max-w-screen-2xl mx-auto w-full -mt-24">
      <Card className=" border-none drop-shadow-sm">
        <CardHeader className=" gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className=" text-xl line-clamp-1">AccountsPage</CardTitle>
          <Button onClick={newAccount.onOpen} size="sm">
            <Plus className=" size-4 mr-2" />
            Add new
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} filterKey="email" onDelete={() => {}} disabled={false} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsPage;

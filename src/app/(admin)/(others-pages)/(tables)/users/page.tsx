'use client';
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserTable from "@/components/tables/UserTable";
import { useCurrentUser } from "@/app/context/usercontext";

export default function UsersPage() {
  const currentUser = useCurrentUser();

  return (
    <div>
      <PageBreadcrumb pageTitle="Users Table" />
      <div className="space-y-6">
        <UserTable currentUser={currentUser} />
      </div>
    </div>
  );
}

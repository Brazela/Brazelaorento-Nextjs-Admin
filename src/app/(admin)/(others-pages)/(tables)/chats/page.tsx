'use client';
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ChatTable from "@/components/tables/ChatTable"; // Fixed import name
import { useCurrentUser } from "@/app/context/usercontext";

export default function ChatsPage() { // Fixed component name
  const currentUser = useCurrentUser();

  return (
    <div>
      <PageBreadcrumb pageTitle="Chats Table" />
      <div className="space-y-6">
        <ChatTable currentUser={currentUser} /> {/* Fixed component name */}
      </div>
    </div>
  );
}
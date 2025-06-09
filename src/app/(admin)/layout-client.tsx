"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { isValidElement, cloneElement } from "react";
import { UserProvider } from '@/app/context/usercontext';


interface User {
  id: number;
  username: string;
  email: string;
  profilePicture: string;
  permission: string;
}

export default function AdminLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  // const content = isValidElement(children) && user
  //   ? cloneElement(children, { currentUser: user })
  //   : children;

    return (
    <div className="min-h-screen xl:flex">
      <AppSidebar user={user} />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader user={user} />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
           <UserProvider user={user}>
          {children}
          </UserProvider>
        </div>
      </div>
    </div>
  );
}
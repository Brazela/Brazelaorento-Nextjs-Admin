"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SendEmailPage from "@/components/sendemail";
import React from "react";

export default function SendEmailLayout() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Send Email" />
      <div className="space-y-6">
        <SendEmailPage />
      </div>
    </div>
  );
}

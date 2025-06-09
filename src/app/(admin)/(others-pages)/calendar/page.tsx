import Calendar from "@/components/calendar/Calendar";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Calendar | Brazelaorento",
  description: "This is Admin Calendar for Brazelaorento website",
};

export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Calendar" />
      <Calendar />
    </div>
  );
}

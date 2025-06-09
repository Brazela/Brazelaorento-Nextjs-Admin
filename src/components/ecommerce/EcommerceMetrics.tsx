"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";



export const EcommerceMetrics = ({
  totalUsers,
  totalProducts
}: {
  totalUsers: number;
  totalProducts: number;
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Users Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Users
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalUsers.toLocaleString()}
            </h4>
          </div>
        </div>
      </div>

      {/* Products Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Products
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalProducts.toLocaleString()}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};
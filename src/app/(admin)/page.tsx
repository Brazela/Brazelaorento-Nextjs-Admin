import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlyChart from "@/components/ecommerce/MonthlyChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { db } from '@/db/index';
import { usersTable, product } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';

export const metadata: Metadata = {
  title: "Admin | Brazelaorento",
  description: "This is Admin Home for Brazelaorento website",
};

export default async function MainPage() {
  // Fetch total users and products
  const totalUsers = await db
    .select({ count: sql<number>`count(*)` })
    .from(usersTable)
    .then(res => res[0].count);

  const totalProducts = await db
    .select({ count: sql<number>`count(*)` })
    .from(product)
    .then(res => res[0].count);

  // Fetch monthly user data
  const monthlyUserData = await db
    .select({
      month: sql<string>`strftime('%m', datetime(verification_code_generated_at, 'unixepoch')) as month`,
      year: sql<string>`strftime('%Y', datetime(verification_code_generated_at, 'unixepoch')) as year`,
      count: sql<number>`count(*) as count`
    })
    .from(usersTable)
    .where(sql`verification_code_generated_at IS NOT NULL`)
    .groupBy(sql`month, year`)
    .all();

  // Fetch monthly product data
  const monthlyProductData = await db
    .select({
      month: sql<string>`strftime('%m', uploaded_date) as month`,
      year: sql<string>`strftime('%Y', uploaded_date) as year`,
      count: sql<number>`count(*) as count`
    })
    .from(product)
    .groupBy(sql`month, year`)
    .all();

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 ">
        <EcommerceMetrics 
          totalUsers={totalUsers} 
          totalProducts={totalProducts} 
        />
        <MonthlyChart monthlyData={monthlyUserData} />
      </div>
      <div className="col-span-12">
        <StatisticsChart 
          userData={monthlyUserData} 
          productData={monthlyProductData} 
        />
      </div>
    </div>
  );
}
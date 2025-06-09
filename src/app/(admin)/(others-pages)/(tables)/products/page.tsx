'use client';
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProductTable from "@/components/tables/ProductTable";
import { Metadata } from "next";
import React from "react";
import { useCurrentUser } from "@/app/context/usercontext";


export default function ProductsTable(){
    const currentUser = useCurrentUser();
  return (
    <div>
      <PageBreadcrumb pageTitle="Products Table" />
      <div className="space-y-6">  
          <ProductTable currentUser={currentUser}/>
      </div>
    </div>
  );
}

"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const LABELS = {
  admin: "Back office",
  orders: "Orders",
  products: "Inventory",
  promos: "Promo codes",
  reviews: "Reviews",
  subscribers: "Subscribers",
  categories: "Categories",
  settings: "Site settings",
  account: "Your account",
  new: "New piece",
};

const AdminHeader = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => ({
    href: `/${segments.slice(0, index + 1).join("/")}`,
    label: LABELS[segment] ?? segment,
    last: index === segments.length - 1,
  }));

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />

      <Separator orientation="vertical" className="mr-1 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb) => (
            <Fragment key={crumb.href}>
              <BreadcrumbItem>
                {crumb.last ? (
                  <BreadcrumbPage className="truncate max-w-[42vw]">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!crumb.last && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
};

export default AdminHeader;

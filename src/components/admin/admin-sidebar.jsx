"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics01Icon,
  Coupon01Icon,
  HangerIcon,
  Logout01Icon,
  Mail01Icon,
  Settings02Icon,
  ShoppingBag03Icon,
  UserCircleIcon,
  StarCircleIcon,
  Store01Icon,
  Tag01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BRAND } from "@/lib/brand";

const SECTIONS = [
  {
    label: "Trading",
    links: [
      { href: "/admin", label: "Overview", icon: Analytics01Icon, exact: true },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag03Icon },
      { href: "/admin/products", label: "Inventory", icon: HangerIcon },
      { href: "/admin/categories", label: "Categories", icon: Tag01Icon },
      { href: "/admin/customers", label: "Customers", icon: UserGroupIcon },
    ],
  },
  {
    label: "Marketing",
    links: [
      { href: "/admin/promos", label: "Promo codes", icon: Coupon01Icon },
      { href: "/admin/reviews", label: "Reviews", icon: StarCircleIcon },
      { href: "/admin/subscribers", label: "Subscribers", icon: Mail01Icon },
    ],
  },
  {
    label: "Shop",
    links: [
      { href: "/admin/settings", label: "Site settings", icon: Settings02Icon },
      { href: "/admin/account", label: "Your account", icon: UserCircleIcon },
    ],
  },
];

const AdminSidebar = ({ name }) => {
  const pathname = usePathname();

  const isActive = ({ href, exact }) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleSignOut = () => signOut({ callbackUrl: "/" });

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HugeiconsIcon icon={Store01Icon} size={16} />
          </span>
          <span className="grid text-sm leading-tight">
            <span className="truncate font-medium">{BRAND.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {name ?? "Back office"}
            </span>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {SECTIONS.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.links.map((link) => (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                      render={<Link href={link.href} />}
                      isActive={isActive(link)}
                      tooltip={link.label}
                    >
                      <HugeiconsIcon icon={link.icon} size={18} />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" />} tooltip="Storefront">
              <HugeiconsIcon icon={Store01Icon} size={18} />
              <span>View the store</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sign out"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <HugeiconsIcon icon={Logout01Icon} size={18} />
              <span className="truncate">Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;

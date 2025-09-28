import { Link, useLocation } from "react-router-dom";
import type { LinkProps } from "react-router-dom";
import { cn } from "../../lib/utils";
import * as React from "react";

export function Sidebar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <aside
      className={cn(
        "h-full w-64 shrink-0 border-r border-gray-200 bg-white flex flex-col",
        className
      )}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-3 border-b border-gray-100", className)} {...props} />;
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 p-3 overflow-auto", className)} {...props} />;
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-3 border-t border-gray-100 text-xs text-gray-500", className)} {...props} />;
}

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2 mb-2 text-xs uppercase tracking-wide text-gray-500", className)} {...props} />;
}

export function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />;
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <nav className={cn("flex flex-col gap-1", className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

interface SidebarMenuButtonProps extends LinkProps {
  icon?: React.ReactNode;
}
export function SidebarMenuButton({ className, icon, ...props }: SidebarMenuButtonProps) {
  const { pathname } = useLocation();
  const active = pathname === props.to || (typeof props.to === "string" && pathname.startsWith(props.to));
  return (
    <Link
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-gray-100",
        className
      )}
      {...props}
    >
      {icon}
      <span>{props.children}</span>
    </Link>
  );
}

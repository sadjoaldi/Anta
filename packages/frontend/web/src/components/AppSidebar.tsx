import { Home, ListOrdered, Users as UsersIcon, UserRound, Car, LineChart, Percent } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="font-semibold">Sadjoaldi</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  to="/dashboard"
                  icon={<Home className="h-4 w-4" />}
                >
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  to="/dashboard/orders"
                  icon={<ListOrdered className="h-4 w-4" />}
                >
                  Orders
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  to="/dashboard/users"
                  icon={<UsersIcon className="h-4 w-4" />}
                >
                  Users
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  to="/dashboard/clients"
                  icon={<UserRound className="h-4 w-4" />}
                >
                  Clients
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  to="/dashboard/drivers"
                  icon={<UsersIcon className="h-4 w-4" />}
                >
                  Chauffeurs
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  to="/dashboard/trips"
                  icon={<Car className="h-4 w-4" />}
                >
                  Trajets
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  to="/dashboard/finance"
                  icon={<LineChart className="h-4 w-4" />}
                >
                  Finances
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  to="/dashboard/promotions"
                  icon={<Percent className="h-4 w-4" />}
                >
                  Promotions
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  to="/dashboard/stats"
                  icon={<LineChart className="h-4 w-4" />}
                >
                  Statistiques
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

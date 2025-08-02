import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  User,
  Settings,
  PlusCircle,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Feed", href: "/feed", icon: MessageSquare },
  { name: "Profile", href: "/profile", icon: User },
];

function Sidebar() {
  return (
    <div className="w-64 bg-card border-r h-screen sticky top-0">
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-6 border-t">
          <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </h3>
          <ul className="mt-4 space-y-2">
            <li>
              <button className="w-full flex items-center px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md">
                <PlusCircle className="mr-3 h-4 w-4" />
                Post a Job
              </button>
            </li>
            <li>
              <button className="w-full flex items-center px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md">
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;

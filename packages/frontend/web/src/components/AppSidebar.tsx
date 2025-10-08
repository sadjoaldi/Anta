import { motion } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  MapPin, 
  DollarSign, 
  Tags, 
  BarChart3,
  History
} from "lucide-react";

const menuItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", gradient: "from-rose-500 to-violet-600" },
  { to: "/dashboard/users", icon: Users, label: "Utilisateurs", gradient: "from-violet-500 to-fuchsia-600" },
  { to: "/dashboard/drivers", icon: Car, label: "Chauffeurs", gradient: "from-fuchsia-500 to-pink-600" },
  { to: "/dashboard/trips", icon: MapPin, label: "Courses", gradient: "from-amber-500 to-orange-600" },
  { to: "/dashboard/finance", icon: DollarSign, label: "Finances", gradient: "from-orange-500 to-red-600" },
  { to: "/dashboard/promotions", icon: Tags, label: "Promotions", gradient: "from-pink-500 to-rose-600" },
  { to: "/dashboard/logs", icon: History, label: "Logs", gradient: "from-gray-500 to-slate-600" },
  { to: "/dashboard/stats", icon: BarChart3, label: "Statistiques", gradient: "from-violet-500 to-purple-600" },
];

export default function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 overflow-y-auto"
    >
      <div className="p-4 space-y-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          
          return (
            <Link key={item.to} to={item.to}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                whileHover={{ x: 5 }}
                className="relative group"
              >
                <div
                  className={`
                    relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${active 
                      ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  {/* Icon */}
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-lg transition-all
                    ${active 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 dark:bg-gray-800 group-hover:scale-110'
                    }
                  `}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  {/* Label */}
                  <span className="font-medium text-sm">
                    {item.label}
                  </span>

                  {/* Hover effect */}
                  {!active && (
                    <div className={`
                      absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 
                      bg-gradient-to-r ${item.gradient} transition-opacity
                    `} />
                  )}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.aside>
  );
}

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavLink: React.FC<{ to: string; label: string } > = ({ to, label }) => {
  const { pathname } = useLocation();
  const active = pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  );
};

export default function Sidebar() {
  return (
    <aside className="w-60 border-r border-gray-200 h-full bg-white p-3 flex flex-col gap-2">
      <div className="text-sm uppercase text-gray-500 px-2 mb-1">Navigation</div>
      <NavLink to="/dashboard" label="Dashboard" />
      <NavLink to="/dashboard/orders" label="Orders" />
      <NavLink to="/dashboard/users" label="Users" />
      <div className="mt-auto text-xs text-gray-400 px-2">v0.1.0</div>
    </aside>
  );
}

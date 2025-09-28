import { useEffect, useState } from "react";

export default function Topbar() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    // Default to dark if no saved preference
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 justify-between dark:bg-gray-950 dark:border-gray-800">
      <div className="font-semibold">ANTA Admin</div>
      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
        <button className="hover:text-gray-900 dark:hover:text-white">Notifications</button>
        <button className="hover:text-gray-900 dark:hover:text-white">Profil</button>
        <button
          className="px-3 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          onClick={() => setTheme(prev => (prev === "dark" ? "light" : "dark"))}
          aria-label="Basculer le thème"
        >
          {theme === "dark" ? "Mode clair" : "Mode sombre"}
        </button>
      </div>
    </header>
  );
}

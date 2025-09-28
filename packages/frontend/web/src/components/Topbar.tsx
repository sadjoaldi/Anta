export default function Topbar() {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 justify-between">
      <div className="font-semibold">ANTA Admin</div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <button className="hover:text-gray-900">Notifications</button>
        <button className="hover:text-gray-900">Profil</button>
      </div>
    </header>
  );
}

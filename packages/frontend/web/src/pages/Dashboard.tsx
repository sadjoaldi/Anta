export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Courses du jour</div>
          <div className="text-3xl font-bold">12</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Utilisateurs actifs</div>
          <div className="text-3xl font-bold">87</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Revenus</div>
          <div className="text-3xl font-bold">FG 3500000</div>
        </div>
      </div>
    </div>
  );
}

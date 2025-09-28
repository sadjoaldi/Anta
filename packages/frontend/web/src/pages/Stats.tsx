export default function Stats() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Statistiques globales</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Courses totales</div>
          <div className="text-3xl font-bold">12,504</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Clients inscrits</div>
          <div className="text-3xl font-bold">3,842</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Chauffeurs inscrits</div>
          <div className="text-3xl font-bold">298</div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <p className="text-gray-600">Graphiques et KPIs globaux à venir…</p>
      </div>
    </div>
  );
}

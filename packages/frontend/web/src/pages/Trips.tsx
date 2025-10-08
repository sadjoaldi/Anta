import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, XCircle, RefreshCw, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Pagination } from "../components/ui/pagination";
import { ExportButton } from "../components/ExportButton";
import tripService from "../services/trip.service";
import type { TripWithDetails } from "../types/api.types";

export default function Trips() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [trips, setTrips] = useState<TripWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || "");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const response = await tripService.getTrips({
        page,
        limit: 15,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setTrips(response.data);
      setTotalPages(response.pagination.pages as number || 1);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleCancelTrip = async (tripId: number) => {
    const reason = prompt("Raison de l'annulation (optionnel) :");
    if (reason === null) return;
    
    try {
      await tripService.cancelTrip(tripId, reason);
      alert("Course annulée avec succès");
      fetchTrips();
    } catch (error) {
      alert("Erreur lors de l'annulation");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge>Complété</Badge>;
      case "in_progress":
        return <Badge variant="secondary">En cours</Badge>;
      case "pending":
        return <Badge variant="warning">En attente</Badge>;
      case "accepted":
        return <Badge variant="secondary">Accepté</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annulé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FG`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Courses
            </h1>
            <p className="text-gray-500 text-sm mt-1">{trips.length} courses affichées</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ExportButton 
            endpoint="/export/trips"
            filename={`trips_${new Date().toISOString().split('T')[0]}.csv`}
            filters={{
              status: statusFilter,
              date_from: dateFrom,
              date_to: dateTo,
            }}
          />
        </motion.div>
      </div>

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date début</label>
                <Input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date fin</label>
                <Input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Statut</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tous</option>
                  <option value="pending">En attente</option>
                  <option value="accepted">Accepté</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Completé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
              <div className="flex items-end col-span-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setStatusFilter("");
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  <X className="h-4 w-4" />
                  Réinitialiser
                </motion.button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des trajets ({trips.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="h-8 w-8 text-amber-600" />
              </motion.div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Chauffeur</TableHead>
                    <TableHead>Départ → Arrivée</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                        Aucun trajet trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    trips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell className="font-medium">{trip.passenger.name}</TableCell>
                        <TableCell>{trip.driver?.name || <span className="text-gray-400">-</span>}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{trip.origin_text}</div>
                            <div className="text-gray-500">→ {trip.dest_text}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDistance(trip.distance_m)}</TableCell>
                        <TableCell className="font-medium">
                          {trip.price_final ? formatPrice(trip.price_final) : formatPrice(trip.price_estimated)}
                        </TableCell>
                        <TableCell>{getStatusBadge(trip.status)}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(trip.created_at).toLocaleString('fr-FR')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {trip.status !== 'cancelled' && trip.status !== 'completed' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCancelTrip(trip.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                            >
                              <XCircle className="h-4 w-4" />
                              Annuler
                            </motion.button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <Pagination className="mt-4" page={page} pageCount={totalPages} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion trajets</h1>
        <ExportButton 
          endpoint="/export/trips"
          filename={`trips_${new Date().toISOString().split('T')[0]}.csv`}
          filters={{
            status: statusFilter,
            date_from: dateFrom,
            date_to: dateTo,
          }}
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-5 gap-3">
            <div>
              <div className="text-xs text-gray-600 mb-1">Date début</div>
              <Input 
                type="date" 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Date fin</div>
              <Input 
                type="date" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Statut</div>
              <select 
                className="w-full border rounded-md h-10 px-3 text-sm"
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
              <Button 
                variant="secondary"
                onClick={() => {
                  setStatusFilter("");
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Liste des trajets ({trips.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCancelTrip(trip.id)}
                            >
                              Annuler
                            </Button>
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
    </div>
  );
}

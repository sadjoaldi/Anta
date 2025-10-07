import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Pagination } from "../components/ui/pagination";
import driverService from "../services/driver.service";
import type { DriverWithUser } from "../types/api.types";

export default function Drivers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [drivers, setDrivers] = useState<DriverWithUser[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [kycFilter, setKycFilter] = useState<string>(searchParams.get('kyc') || "");

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await driverService.getDrivers({
        page,
        limit: 10,
        kyc_status: kycFilter || undefined,
      });
      setDrivers(response.data);
      setTotalPages(response.pagination.pages || 1);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  }, [page, kycFilter]);

  // Fetch drivers
  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Fetch stats
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const statsData = await driverService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleApprove = async (driverId: number) => {
    if (!confirm("Voulez-vous vraiment approuver ce chauffeur ?")) return;
    
    try {
      await driverService.approveKyc(driverId);
      alert("Chauffeur approuvé avec succès !");
      fetchDrivers();
      fetchStats();
    } catch (error) {
      alert("Erreur lors de l'approbation");
      console.error(error);
    }
  };

  const handleReject = async (driverId: number) => {
    const reason = prompt("Raison du rejet (optionnel) :");
    if (reason === null) return; // User cancelled
    
    try {
      await driverService.rejectKyc(driverId, reason);
      alert("Chauffeur rejeté");
      fetchDrivers();
      fetchStats();
    } catch (error) {
      alert("Erreur lors du rejet");
      console.error(error);
    }
  };

  const getKycBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge>Validé</Badge>;
      case "pending":
        return <Badge variant="warning">En attente</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Gestion chauffeurs</h1>
      <Card>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <div className="text-xs text-gray-600 mb-1">Date d'inscription</div>
              <Input type="date" />
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Statut KYC</div>
              <select 
                className="w-full border rounded-md h-10 px-3 text-sm"
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
              >
                <option value="">Tous</option>
                <option value="pending">En attente</option>
                <option value="approved">Validé</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={() => setKycFilter("")} variant="secondary">Réinitialiser</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Chauffeurs actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">En attente de validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Note moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Number(stats.averageRating).toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des chauffeurs</CardTitle>
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
                    <TableHead>Nom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Statut KYC</TableHead>
                    <TableHead className="text-right">Note</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        Aucun chauffeur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    drivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell>{driver.user.name}</TableCell>
                        <TableCell>{driver.user.phone}</TableCell>
                        <TableCell>
                          {driver.vehicle_type ? (
                            <span className="text-sm">
                              {driver.vehicle_brand} {driver.vehicle_model}
                              <br />
                              <span className="text-xs text-gray-500">{driver.vehicle_plate}</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">Non renseigné</span>
                          )}
                        </TableCell>
                        <TableCell>{getKycBadge(driver.kyc_status)}</TableCell>
                        <TableCell className="text-right">{Number(driver.rating_avg).toFixed(1)} ⭐</TableCell>
                        <TableCell className="text-right space-x-2">
                          {driver.kyc_status === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleApprove(driver.id)}
                              >
                                Approuver
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleReject(driver.id)}
                              >
                                Rejeter
                              </Button>
                            </>
                          )}
                          {driver.kyc_status === "approved" && (
                            <Button size="sm" variant="outline" disabled>
                              Approuvé
                            </Button>
                          )}
                          {driver.kyc_status === "rejected" && (
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleApprove(driver.id)}
                            >
                              Réapprouver
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

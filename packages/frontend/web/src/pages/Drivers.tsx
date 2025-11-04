import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, CheckCircle, RefreshCw, X, Star, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Pagination } from "../components/ui/pagination";
import { ExportButton } from "../components/ExportButton";
import KYCValidationModal from "../components/KYCValidationModal";
import driverService from "../services/driver.service";
import type { DriverWithUser } from "../types/api.types";

export default function Drivers() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [drivers, setDrivers] = useState<DriverWithUser[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [kycFilter, setKycFilter] = useState<string>(searchParams.get('kyc') || "");
  const [selectedDriver, setSelectedDriver] = useState<DriverWithUser | null>(null);
  const [showKYCModal, setShowKYCModal] = useState(false);

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

  const handleViewKYC = (driver: DriverWithUser) => {
    setSelectedDriver(driver);
    setShowKYCModal(true);
  };

  const handleCloseKYCModal = () => {
    setShowKYCModal(false);
    setSelectedDriver(null);
  };

  const handleApproveFromModal = async (driverId: number) => {
    try {
      await driverService.approveKyc(driverId);
      fetchDrivers();
      fetchStats();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleRejectFromModal = async (driverId: number, reason: string) => {
    try {
      await driverService.rejectKyc(driverId, reason);
      fetchDrivers();
      fetchStats();
    } catch (error) {
      console.error(error);
      throw error;
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
          <div className="p-3 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-xl shadow-lg">
            <Car className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
              Chauffeurs
            </h1>
            <p className="text-gray-500 text-sm mt-1">{drivers.length} chauffeurs affichés</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ExportButton 
            endpoint="/export/drivers"
            filename={`drivers_${new Date().toISOString().split('T')[0]}.csv`}
            filters={{
              kyc_status: kycFilter,
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
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date d'inscription</label>
                <Input type="date" className="rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Statut KYC</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setKycFilter("")}
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

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <motion.div whileHover={{ scale: 1.02, y: -5 }}>
          <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Chauffeurs actifs</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.active}</h3>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02, y: -5 }}>
          <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">En attente</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.pending}</h3>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02, y: -5 }}>
          <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Note moyenne</p>
                  <h3 className="text-3xl font-bold text-gray-900">{Number(stats.averageRating).toFixed(1)}</h3>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des chauffeurs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="h-8 w-8 text-fuchsia-600" />
              </motion.div>
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
                        <TableCell className="text-right">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewKYC(driver)}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
                          >
                            <Eye className="h-4 w-4" />
                            Voir détails
                          </motion.button>
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

      {/* KYC Validation Modal */}
      {showKYCModal && selectedDriver && (
        <KYCValidationModal
          driver={selectedDriver}
          onClose={handleCloseKYCModal}
          onApprove={handleApproveFromModal}
          onReject={handleRejectFromModal}
        />
      )}
    </motion.div>
  );
}

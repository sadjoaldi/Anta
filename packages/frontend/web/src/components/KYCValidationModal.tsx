import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  XCircle,
  User,
  Car,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Phone,
  Calendar,
  Star,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import ImageViewer from "./ImageViewer";
import type { DriverWithUser } from "../types/api.types";

interface KYCValidationModalProps {
  driver: DriverWithUser;
  onClose: () => void;
  onApprove: (driverId: number) => Promise<void>;
  onReject: (driverId: number, reason: string) => Promise<void>;
}

export default function KYCValidationModal({
  driver,
  onClose,
  onApprove,
  onReject,
}: KYCValidationModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "documents">("documents");
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Préparer les images pour le viewer
  const documentImages = [
    {
      url: driver.kyc_documents?.photo_profil || "https://via.placeholder.com/800x600?text=Photo+Profil",
      label: "Photo de Profil",
    },
    {
      url: driver.kyc_documents?.photo_cni_recto || "https://via.placeholder.com/800x600?text=CNI+Recto",
      label: "CNI - Recto",
    },
    {
      url: driver.kyc_documents?.photo_cni_verso || "https://via.placeholder.com/800x600?text=CNI+Verso",
      label: "CNI - Verso",
    },
    {
      url: driver.kyc_documents?.photo_permis_recto || "https://via.placeholder.com/800x600?text=Permis+Recto",
      label: "Permis - Recto",
    },
    {
      url: driver.kyc_documents?.photo_permis_verso || "https://via.placeholder.com/800x600?text=Permis+Verso",
      label: "Permis - Verso",
    },
    {
      url: driver.kyc_documents?.photo_carte_grise || "https://via.placeholder.com/800x600?text=Carte+Grise",
      label: "Carte Grise",
    },
    {
      url: driver.kyc_documents?.photo_vehicule || "https://via.placeholder.com/800x600?text=Véhicule",
      label: "Photo du Véhicule",
    },
  ];

  const handleApproveClick = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir APPROUVER ${driver.user.name} ?`)) return;

    setLoading(true);
    try {
      await onApprove(driver.id);
      onClose();
    } catch (error) {
      console.error("Error approving driver:", error);
      alert("Erreur lors de l'approbation");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert("Veuillez indiquer une raison de rejet");
      return;
    }

    setLoading(true);
    try {
      await onReject(driver.id, rejectReason);
      onClose();
    } catch (error) {
      console.error("Error rejecting driver:", error);
      alert("Erreur lors du rejet");
    } finally {
      setLoading(false);
    }
  };

  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700">✓ Validé</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">⏳ En attente</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">✗ Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-fuchsia-600 to-pink-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                    {driver.kyc_documents?.photo_profil ? (
                      <img
                        src={driver.kyc_documents.photo_profil}
                        alt={driver.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{driver.user.name}</h2>
                    <p className="text-white/80 flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4" />
                      {driver.user.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getKycStatusBadge(driver.kyc_status)}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex gap-4 px-6">
                <button
                  onClick={() => setActiveTab("documents")}
                  className={`py-4 px-6 font-medium border-b-2 transition-colors ${
                    activeTab === "documents"
                      ? "border-fuchsia-600 text-fuchsia-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ImageIcon className="h-5 w-5 inline-block mr-2" />
                  Documents
                </button>
                <button
                  onClick={() => setActiveTab("info")}
                  className={`py-4 px-6 font-medium border-b-2 transition-colors ${
                    activeTab === "info"
                      ? "border-fuchsia-600 text-fuchsia-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FileText className="h-5 w-5 inline-block mr-2" />
                  Informations
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "documents" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-fuchsia-600" />
                    Documents KYC
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {documentImages.map((doc, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setSelectedImageIndex(idx);
                          setShowImageViewer(true);
                        }}
                        className="group relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-fuchsia-500 transition-all shadow-sm hover:shadow-md"
                      >
                        <img
                          src={doc.url}
                          alt={doc.label}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                          <p className="text-white text-xs font-medium p-2">{doc.label}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "info" && (
                <div className="space-y-6">
                  {/* Informations personnelles */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-fuchsia-600" />
                        Informations Personnelles
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Nom complet</label>
                          <p className="font-medium mt-1">{driver.user.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Téléphone</label>
                          <p className="font-medium mt-1">{driver.user.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <p className="font-medium mt-1">{driver.user.email || "Non renseigné"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Numéro de permis</label>
                          <p className="font-medium mt-1">{driver.license_number || "Non renseigné"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Inscription</label>
                          <p className="font-medium mt-1">
                            <Calendar className="h-4 w-4 inline-block mr-1" />
                            {new Date(driver.user.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Note moyenne</label>
                          <p className="font-medium mt-1">
                            <Star className="h-4 w-4 inline-block mr-1 text-yellow-500" />
                            {Number(driver.rating_avg).toFixed(1)} ({driver.total_trips} courses)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Informations véhicule */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Car className="h-5 w-5 text-fuchsia-600" />
                        Véhicule
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Type</label>
                          <p className="font-medium mt-1">{driver.vehicle_type || "Non renseigné"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Marque & Modèle</label>
                          <p className="font-medium mt-1">
                            {driver.vehicle_brand || "Non renseigné"} {driver.vehicle_model || ""}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Couleur</label>
                          <p className="font-medium mt-1">{driver.vehicle_color || "Non renseigné"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Plaque d'immatriculation</label>
                          <p className="font-medium mt-1 text-lg tracking-wider bg-gray-100 px-3 py-1 rounded inline-block">
                            {driver.vehicle_plate || "Non renseigné"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Capacité</label>
                          <p className="font-medium mt-1">{driver.vehicle_capacity || "Non renseigné"} places</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Informations bancaires */}
                  {(driver.bank_name || driver.account_number) && (
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-fuchsia-600" />
                          Informations Bancaires
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Banque</label>
                            <p className="font-medium mt-1">{driver.bank_name || "Non renseigné"}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Numéro de compte</label>
                            <p className="font-medium mt-1">{driver.account_number || "Non renseigné"}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Titulaire</label>
                            <p className="font-medium mt-1">{driver.account_holder || "Non renseigné"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Raison de rejet si rejeté */}
                  {driver.kyc_status === "rejected" && driver.kyc_rejection_reason && (
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-700">
                          <AlertTriangle className="h-5 w-5" />
                          Raison du Rejet
                        </h3>
                        <p className="text-red-700">{driver.kyc_rejection_reason}</p>
                        {driver.kyc_rejected_at && (
                          <p className="text-sm text-red-600 mt-2">
                            Rejeté le {new Date(driver.kyc_rejected_at).toLocaleString("fr-FR")}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Footer - Actions */}
            {driver.kyc_status === "pending" && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                {!showRejectForm ? (
                  <div className="flex items-center justify-end gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowRejectForm(true)}
                      disabled={loading}
                      className="px-6 py-3 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <XCircle className="h-5 w-5" />
                      Rejeter
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleApproveClick}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg font-medium shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      {loading ? "Approbation..." : "Approuver le chauffeur"}
                    </motion.button>
                  </div>
                ) : (
                  <form onSubmit={handleRejectSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Raison du rejet <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Ex: Documents illisibles, informations incohérentes, permis expiré..."
                        className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectReason("");
                        }}
                        disabled={loading}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
                      >
                        Annuler
                      </button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading || !rejectReason.trim()}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <XCircle className="h-5 w-5" />
                        {loading ? "Rejet..." : "Confirmer le Rejet"}
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {driver.kyc_status === "rejected" && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApproveClick}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg font-medium shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  {loading ? "Réapprobation..." : "Réapprouver le chauffeur"}
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Image Viewer */}
      {showImageViewer && (
        <ImageViewer
          images={documentImages}
          initialIndex={selectedImageIndex}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </>
  );
}

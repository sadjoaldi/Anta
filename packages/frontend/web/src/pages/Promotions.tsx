import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Tags } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Pagination } from "../components/ui/pagination";
import { ExportButton } from "../components/ExportButton";
import promotionService from "../services/promotion.service";
import type { Promotion } from "../types/api.types";

export default function Promotions() {
  const [page, setPage] = useState(1);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "percentage" as "percentage" | "fixed_amount",
    value: 0,
    min_trip_amount: 0,
    max_discount: 0,
    usage_limit: 0,
    usage_per_user: 0,
    valid_from: "",
    valid_until: "",
  });

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await promotionService.getPromotions({
        page,
        limit: 20,
      });
      setPromotions(response.data);
      setTotalPages(response.pagination.pages as number || 1);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      type: "percentage",
      value: 0,
      min_trip_amount: 0,
      max_discount: 0,
      usage_limit: 0,
      usage_per_user: 0,
      valid_from: "",
      valid_until: "",
    });
    setEditingPromotion(null);
    setShowForm(false);
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromotion(promo);
    setFormData({
      code: promo.code,
      description: promo.description || "",
      type: promo.type,
      value: promo.value,
      min_trip_amount: promo.min_trip_amount || 0,
      max_discount: promo.max_discount || 0,
      usage_limit: promo.usage_limit || 0,
      usage_per_user: promo.usage_per_user || 0,
      valid_from: promo.valid_from ? new Date(promo.valid_from).toISOString().split('T')[0] : "",
      valid_until: promo.valid_until ? new Date(promo.valid_until).toISOString().split('T')[0] : "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPromotion) {
        await promotionService.updatePromotion(editingPromotion.id, formData);
        alert("Promotion mise à jour avec succès");
      } else {
        await promotionService.createPromotion(formData);
        alert("Promotion créée avec succès");
      }
      fetchPromotions();
      resetForm();
    } catch (error) {
      alert("Erreur lors de l'enregistrement");
      console.error(error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await promotionService.togglePromotion(id);
      fetchPromotions();
    } catch (error) {
      alert("Erreur lors de l'activation/désactivation");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) return;

    try {
      await promotionService.deletePromotion(id);
      alert("Promotion supprimée avec succès");
      fetchPromotions();
    } catch (error) {
      alert("Erreur lors de la suppression");
      console.error(error);
    }
  };

  const formatValue = (promo: Promotion) => {
    if (promo.type === "percentage") {
      return `${promo.value}%`;
    }
    return `${promo.value.toLocaleString()} FG`;
  };

  const activePromotions = promotions.filter(p => p.is_active);
  const totalUsages = promotions.reduce((sum, p) => sum + p.usage_count, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-8"
    >
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
            <Tags className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Promotions
            </h1>
            <p className="text-gray-500 text-sm mt-1">{promotions.length} promotions créées</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex gap-2"
        >
          <ExportButton 
            endpoint="/export/promotions"
            filename={`promotions_${new Date().toISOString().split('T')[0]}.csv`}
          />
          <Button onClick={() => setShowForm(true)}>+ Créer une promotion</Button>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Promotions actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activePromotions.length}</div>
            <div className="text-xs text-gray-500 mt-1">sur {promotions.length} total</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Utilisations totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{promotions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPromotion ? "Modifier la promotion" : "Créer une promotion"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Code *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="PROMO10"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type *</label>
                  <select
                    className="w-full border rounded-md h-10 px-3 text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed_amount' })}
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed_amount">Montant fixe (FG)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Valeur *</label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                    placeholder={formData.type === "percentage" ? "10" : "5000"}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Montant minimum course</label>
                  <Input
                    type="number"
                    value={formData.min_trip_amount}
                    onChange={(e) => setFormData({ ...formData, min_trip_amount: parseFloat(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Réduction maximum</label>
                  <Input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: parseFloat(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Limite d'utilisations totale</label>
                  <Input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Limite par utilisateur</label>
                  <Input
                    type="number"
                    value={formData.usage_per_user}
                    onChange={(e) => setFormData({ ...formData, usage_per_user: parseInt(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Valide à partir de</label>
                  <Input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Valide jusqu'à</label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la promotion"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingPromotion ? "Mettre à jour" : "Créer"}</Button>
                <Button type="button" variant="secondary" onClick={resetForm}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des promotions ({promotions.length})</CardTitle>
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
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Usages</TableHead>
                    <TableHead>Validité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                        Aucune promotion trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    promotions.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="font-bold">{promo.code}</TableCell>
                        <TableCell>{promo.description || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {promo.type === "percentage" ? "Pourcentage" : "Montant fixe"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-green-600">{formatValue(promo)}</TableCell>
                        <TableCell>
                          {promo.usage_count}
                          {promo.usage_limit && ` / ${promo.usage_limit}`}
                        </TableCell>
                        <TableCell>
                          {promo.valid_until ? (
                            <span className="text-sm">
                              {new Date(promo.valid_until).toLocaleDateString('fr-FR')}
                            </span>
                          ) : (
                            <span className="text-gray-400">Illimitée</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {promo.is_active ? (
                            <Badge>Actif</Badge>
                          ) : (
                            <Badge variant="secondary">Inactif</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="secondary" onClick={() => handleEdit(promo)}>
                            Modifier
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleToggle(promo.id)}
                          >
                            {promo.is_active ? "Désactiver" : "Activer"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(promo.id)}
                          >
                            Supprimer
                          </Button>
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

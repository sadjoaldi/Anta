import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Pagination } from "../components/ui/pagination";
import paymentService from "../services/payment.service";
import type { PaymentWithTrip } from "../types/api.types";

export default function Finance() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [payments, setPayments] = useState<PaymentWithTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || "");
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPayments({
        page,
        limit: 20,
        status: statusFilter || undefined,
        method: methodFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setPayments(response.data);
      setTotalPages(response.pagination.pages as number || 1);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, methodFilter, dateFrom, dateTo]);

  const fetchRevenue = async () => {
    try {
      const response = await paymentService.getTotalRevenue();
      setTotalRevenue(response.total);
    } catch (error) {
      console.error("Error fetching revenue:", error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge>Complété</Badge>;
      case "pending":
        return <Badge variant="warning">En attente</Badge>;
      case "failed":
        return <Badge variant="destructive">Échoué</Badge>;
      case "refunded":
        return <Badge variant="secondary">Remboursé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return <Badge variant="secondary">Cash</Badge>;
      case "mobile_money":
        return <Badge>Mobile Money</Badge>;
      case "card":
        return <Badge variant="secondary">Carte</Badge>;
      default:
        return <Badge>{method}</Badge>;
    }
  };

  const formatPrice = (price?: number) => {
    if (!price && price !== 0) return '0 FG';
    return `${price.toLocaleString()} FG`;
  };

  const completedPayments = payments.filter(p => p.status === 'completed');
  const completedTotal = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const failedPayments = payments.filter(p => p.status === 'failed');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Suivi financier</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Revenus totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatPrice(totalRevenue)}</div>
            <div className="text-xs text-gray-500 mt-1">Tous les paiements complétés</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Cette page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPrice(completedTotal)}</div>
            <div className="text-xs text-gray-500 mt-1">{completedPayments.length} paiements</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pendingPayments.length}</div>
            <div className="text-xs text-gray-500 mt-1">À valider</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Échoués</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{failedPayments.length}</div>
            <div className="text-xs text-gray-500 mt-1">À vérifier</div>
          </CardContent>
        </Card>
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
                <option value="completed">Complété</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoué</option>
                <option value="refunded">Remboursé</option>
              </select>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Méthode</div>
              <select 
                className="w-full border rounded-md h-10 px-3 text-sm"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="">Toutes</option>
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="card">Carte</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="secondary"
                onClick={() => {
                  setStatusFilter("");
                  setMethodFilter("");
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
          <CardTitle>Transactions ({payments.length})</CardTitle>
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
                    <TableHead>ID</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        Aucun paiement trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">#{payment.id}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">Trajet #{payment.trip_id}</div>
                            {payment.trip && (
                              <div className="text-gray-500">
                                {payment.trip.origin_text} → {payment.trip.dest_text}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">{formatPrice(payment.amount)}</TableCell>
                        <TableCell>{getMethodBadge(payment.method)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-gray-500">
                            {payment.provider_ref || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm">
                            {new Date(payment.created_at).toLocaleString('fr-FR')}
                          </span>
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

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Pagination } from "../components/ui/pagination";
import { RefreshCw } from "lucide-react";
import adminLogService from "../services/adminLog.service";
import type { AdminLog } from "../types/api.types";

export default function AdminLogs() {
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [actionFilter, setActionFilter] = useState<string>("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const fetchLogs = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await adminLogService.getAdminLogs({
        page,
        limit: 20,
        action: actionFilter || undefined,
        resource_type: resourceTypeFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setLogs(response.data);
      setTotalPages(response.pagination.pages as number || 1);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching admin logs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, actionFilter, resourceTypeFilter, dateFrom, dateTo]);

  // Initial load
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const handleManualRefresh = () => {
    fetchLogs(true);
  };

  const formatRelativeTime = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'à l\'instant';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `il y a ${hours}h`;
  };

  const getActionBadge = (action: string) => {
    if (action.includes('suspend') || action.includes('reject') || action.includes('delete')) {
      return <Badge variant="destructive">{action}</Badge>;
    }
    if (action.includes('approve') || action.includes('activate')) {
      return <Badge>{action}</Badge>;
    }
    return <Badge variant="secondary">{action}</Badge>;
  };

  const formatDetails = (details?: string | null) => {
    if (!details) return '-';
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Logs d'activité admin</h1>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleManualRefresh} 
            variant="outline" 
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Rafraîchir
          </Button>
          
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="cursor-pointer"
            />
            <span>Auto-refresh (30s)</span>
          </label>
          
          <span className="text-xs text-gray-500">
            Mis à jour : {formatRelativeTime(lastRefresh)}
          </span>
        </div>
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
              <div className="text-xs text-gray-600 mb-1">Action</div>
              <Input 
                placeholder="Ex: user_suspended" 
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Type de ressource</div>
              <select 
                className="w-full border rounded-md h-10 px-3 text-sm"
                value={resourceTypeFilter}
                onChange={(e) => setResourceTypeFilter(e.target.value)}
              >
                <option value="">Tous</option>
                <option value="user">User</option>
                <option value="driver">Driver</option>
                <option value="trip">Trip</option>
                <option value="payment">Payment</option>
                <option value="promotion">Promotion</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="secondary"
                onClick={() => {
                  setActionFilter("");
                  setResourceTypeFilter("");
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
          <CardTitle>Historique des actions ({logs.length})</CardTitle>
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
                    <TableHead>Date/Heure</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Ressource</TableHead>
                    <TableHead>Détails</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        Aucun log trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {new Date(log.created_at).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-gray-500">
                              {new Date(log.created_at).toLocaleTimeString('fr-FR')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{log.admin_name || 'N/A'}</div>
                            <div className="text-gray-500 text-xs">{log.admin_email || ''}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{log.resource_type}</div>
                            {log.resource_id && (
                              <div className="text-gray-500 text-xs">ID: {log.resource_id}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-gray-600 max-w-xs truncate" title={formatDetails(log.details)}>
                            {formatDetails(log.details)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-gray-500">
                            {log.ip_address || '-'}
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

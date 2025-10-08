import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Users as UsersIcon, Search, RefreshCw, X, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Pagination } from "../components/ui/pagination";
import { ExportButton } from "../components/ExportButton";
import userService from "../services/user.service";
import type { User } from "../types/api.types";

export default function Users() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState<string>(searchParams.get('role') || "");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>(searchParams.get('filter') || "");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers({
        page,
        limit: 15,
        role: roleFilter || undefined,
        search: searchQuery || undefined,
        filter: filterType || undefined,
      });
      setUsers(response.data);
      setTotalPages(response.pagination.pages as number || 1);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, searchQuery, filterType]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSuspend = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir suspendre cet utilisateur ?")) return;
    
    try {
      const updatedUser = await userService.suspendUser(userId);
      
      // Mettre à jour seulement le user concerné dans la liste
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? updatedUser : u)
      );
      
      alert("Utilisateur suspendu avec succès");
    } catch (error) {
      alert("Erreur lors de la suspension");
      console.error(error);
    }
  };

  const handleActivate = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir activer cet utilisateur ?")) return;
    
    try {
      const updatedUser = await userService.activateUser(userId);
      
      // Mettre à jour seulement le user concerné dans la liste
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? updatedUser : u)
      );
      
      alert("Utilisateur activé avec succès");
    } catch (error) {
      alert("Erreur lors de l'activation");
      console.error(error);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>;
      case "driver":
        return <Badge>Chauffeur</Badge>;
      case "passenger":
        return <Badge variant="secondary">Passager</Badge>;
      default:
        return <Badge>{role}</Badge>;
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
          <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl shadow-lg">
            <UsersIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Utilisateurs
            </h1>
            <p className="text-gray-500 text-sm mt-1">{users.length} utilisateurs affichés</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ExportButton 
            endpoint="/export/users"
            filename={`users_${new Date().toISOString().split('T')[0]}.csv`}
            filters={{
              role: roleFilter,
              search: searchQuery,
              filter: filterType,
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
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Nom ou téléphone..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Rôle</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">Tous</option>
                  <option value="passenger">Passager</option>
                  <option value="driver">Chauffeur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Filtre</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">Tous</option>
                  <option value="new_today">Nouveaux aujourd'hui</option>
                  <option value="active">Actifs (7j)</option>
                </select>
              </div>
              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setRoleFilter("");
                    setSearchQuery("");
                    setFilterType("");
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
          <CardTitle>Liste des utilisateurs ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="h-8 w-8 text-violet-600" />
              </motion.div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          {user.is_active ? (
                            <Badge>Actif</Badge>
                          ) : (
                            <Badge variant="secondary">Suspendu</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.last_login_at ? (
                            <span className="text-sm">
                              {new Date(user.last_login_at).toLocaleDateString('fr-FR')}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">Jamais</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {user.is_active ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSuspend(user.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                            >
                              <UserX className="h-4 w-4" />
                              Suspendre
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleActivate(user.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
                            >
                              <UserCheck className="h-4 w-4" />
                              Activer
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

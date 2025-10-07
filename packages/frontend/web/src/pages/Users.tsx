import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Pagination } from "../components/ui/pagination";
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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Utilisateurs</h1>

      <Card>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-5 gap-3">
            <div className="col-span-2">
              <div className="text-xs text-gray-600 mb-1">Rechercher</div>
              <Input 
                placeholder="Nom ou téléphone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Rôle</div>
              <select 
                className="w-full border rounded-md h-10 px-3 text-sm"
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
              <div className="text-xs text-gray-600 mb-1">Filtre</div>
              <select 
                className="w-full border rounded-md h-10 px-3 text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Tous</option>
                <option value="new_today">Nouveaux aujourd'hui</option>
                <option value="active">Actifs (7j)</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setRoleFilter("");
                  setSearchQuery("");
                  setFilterType("");
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
          <CardTitle>Liste des utilisateurs ({users.length})</CardTitle>
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
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSuspend(user.id)}
                            >
                              Suspendre
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => handleActivate(user.id)}
                            >
                              Activer
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

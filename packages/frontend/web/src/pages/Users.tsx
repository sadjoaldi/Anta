import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Pagination } from "../components/ui/pagination";

export default function Users() {
  const [page, setPage] = useState(1);
  const pageCount = 5;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Utilisateurs</h1>

      <Card>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-5 gap-3">
            <div>
              <div className="text-xs text-gray-600 mb-1">Date de création</div>
              <Input type="date" />
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Rôle</div>
              <select className="w-full border rounded-md h-10 px-3 text-sm">
                <option value="">Tous</option>
                <option>Admin</option>
                <option>Client</option>
              </select>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Statut</div>
              <select className="w-full border rounded-md h-10 px-3 text-sm">
                <option value="">Tous</option>
                <option>Actif</option>
                <option>Suspendu</option>
              </select>
            </div>
            <div className="flex items-end gap-2 col-span-2 md:col-span-1">
              <Button>Filtrer</Button>
              <Button variant="secondary">Réinitialiser</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3,842</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Actifs (7j)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,120</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Nouveaux (30j)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">210</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Sadjoaldi</TableCell>
                <TableCell>admin@anta.com</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell><Badge>Actif</Badge></TableCell>
                <TableCell className="text-right">2025-06-10</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="secondary">Voir</Button>
                  <Button size="sm" variant="outline">Suspendre</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Fatou Keita</TableCell>
                <TableCell>fatou@example.com</TableCell>
                <TableCell>Client</TableCell>
                <TableCell><Badge variant="warning">Suspendu</Badge></TableCell>
                <TableCell className="text-right">2025-09-01</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="secondary">Voir</Button>
                  <Button size="sm" variant="outline">Activer</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Pagination className="mt-4" page={page} pageCount={pageCount} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}

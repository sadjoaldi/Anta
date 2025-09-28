import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Pagination } from "../components/ui/pagination";

export default function Trips() {
  const [page, setPage] = useState(1);
  const pageCount = 4;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Gestion trajets</h1>

      <Card>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <div className="text-xs text-gray-600 mb-1">Date</div>
              <Input type="date" />
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Statut</div>
              <select className="w-full border rounded-md h-10 px-3 text-sm">
                <option value="">Tous</option>
                <option>Complété</option>
                <option>En cours</option>
                <option>Annulé</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button>Filtrer</Button>
              <Button variant="secondary">Réinitialiser</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Trajets du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">58</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">9</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Taux de complétion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">96%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des trajets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Chauffeur</TableHead>
                <TableHead>Départ → Arrivée</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Marie Diallo</TableCell>
                <TableCell>Mamadou Bah</TableCell>
                <TableCell>Kaloum → Ratoma</TableCell>
                <TableCell><Badge>Complété</Badge></TableCell>
                <TableCell className="text-right">2025-09-15 10:30</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="secondary">Voir</Button>
                  <Button size="sm" variant="outline">Réouvrir</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>I. Camara</TableCell>
                <TableCell>A. Barry</TableCell>
                <TableCell>Matam → Matoto</TableCell>
                <TableCell><Badge variant="info">En cours</Badge></TableCell>
                <TableCell className="text-right">2025-09-15 11:05</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="secondary">Voir</Button>
                  <Button size="sm" variant="outline">Annuler</Button>
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

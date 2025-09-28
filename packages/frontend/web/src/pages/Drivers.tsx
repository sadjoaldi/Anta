import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Pagination } from "../components/ui/pagination";

export default function Drivers() {
  const [page, setPage] = useState(1);
  const pageCount = 5;
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
              <div className="text-xs text-gray-600 mb-1">Statut</div>
              <select className="w-full border rounded-md h-10 px-3 text-sm">
                <option value="">Tous</option>
                <option>Validé</option>
                <option>En attente</option>
                <option>Suspendu</option>
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
            <CardTitle className="text-sm text-gray-500">Chauffeurs actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">75</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">En attente de validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">6</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Note moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.6</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des chauffeurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Mamadou Bah</TableCell>
                <TableCell>+224 622 22 33 44</TableCell>
                <TableCell><Badge>Validé</Badge></TableCell>
                <TableCell className="text-right">2025-08-20</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="secondary">Voir</Button>
                  <Button size="sm" variant="outline">Suspendre</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Aïssatou Barry</TableCell>
                <TableCell>+224 623 00 11 22</TableCell>
                <TableCell><Badge variant="warning">En attente</Badge></TableCell>
                <TableCell className="text-right">2025-09-10</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="secondary">Voir</Button>
                  <Button size="sm" variant="outline">Valider</Button>
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

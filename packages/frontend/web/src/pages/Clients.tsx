import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

export default function Clients() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Gestion clients</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Clients actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">243</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Nouveaux ce mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">31</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Taux de rétention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">82%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead className="text-right">Inscription</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Marie Diallo</TableCell>
                <TableCell>marie@example.com</TableCell>
                <TableCell>+224 620 00 00 00</TableCell>
                <TableCell className="text-right">2025-09-01</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Ibrahima Camara</TableCell>
                <TableCell>ibrahima@example.com</TableCell>
                <TableCell>+224 621 11 22 33</TableCell>
                <TableCell className="text-right">2025-09-12</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

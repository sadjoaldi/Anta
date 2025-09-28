import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

export default function Promotions() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Gestion promotions</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Promotions actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Utilisations (30j)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">132</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Valeur moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Remise</TableHead>
                <TableHead>Validité</TableHead>
                <TableHead className="text-right">Usages</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>WELCOME10</TableCell>
                <TableCell>Réduction de bienvenue</TableCell>
                <TableCell>10%</TableCell>
                <TableCell>2025-12-31</TableCell>
                <TableCell className="text-right">54</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>WEEKEND15</TableCell>
                <TableCell>Promo weekend</TableCell>
                <TableCell>15%</TableCell>
                <TableCell>2025-10-31</TableCell>
                <TableCell className="text-right">23</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

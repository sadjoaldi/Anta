import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

export default function Finance() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Suivi financier</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Revenus (30j)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€ 12,430</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€ 2,145</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Remboursements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€ 120</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>#TRX-1042</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>€ 8.50</TableCell>
                <TableCell>Cash</TableCell>
                <TableCell className="text-right">2025-09-15 10:18</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>#TRX-1043</TableCell>
                <TableCell>Commission</TableCell>
                <TableCell>€ 1.20</TableCell>
                <TableCell>Auto</TableCell>
                <TableCell className="text-right">2025-09-15 10:19</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

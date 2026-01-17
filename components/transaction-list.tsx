import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function TransactionList() {
  return (
    <Card className="md:col-span-8">
      <CardHeader>
        <CardTitle>Últimas Movimentações</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Dados Fictícios para visualizar */}
            <TableRow>
              <TableCell className="font-medium">
                Compra Semanal
              </TableCell>
              <TableCell>Alimentação</TableCell>
              <TableCell>17/01/2026</TableCell>
              <TableCell className="text-right text-rose-600">
                - R$ 450,00
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                Pagamento Projeto
              </TableCell>
              <TableCell>Trabalho</TableCell>
              <TableCell>15/01/2026</TableCell>
              <TableCell className="text-right text-emerald-600">
                + R$ 2.500,00
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                Internet Fibra
              </TableCell>
              <TableCell>Contas Fixas</TableCell>
              <TableCell>10/01/2026</TableCell>
              <TableCell className="text-right text-rose-600">
                - R$ 120,00
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

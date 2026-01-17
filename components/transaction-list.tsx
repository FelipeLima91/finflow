import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Transaction } from "@/types";

interface TransactionListProps {
  transacoes: Transaction[];
}

export function TransactionList({ transacoes }: TransactionListProps) {
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
            {transacoes.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {transaction.description}
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>
                  {new Date(transaction.date).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell
                  className={`text-right ${transaction.type === "income" ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {transaction.type === "expense" ? "- " : "+ "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
            {transacoes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground h-24"
                >
                  Nenhuma transação registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Transaction } from "@/types";
import { useState } from "react";
import { Button } from "./ui/button";
import { Pencil, Trash } from "lucide-react";

interface TransactionListProps {
  transacoes: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionList({ transacoes, onDelete }: TransactionListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };
  const handleDelete = async () => {
    if (deleteId) {

      await onDelete(deleteId);

      setDeleteId(null);
    }
  };

  return (
    <Card className="md:col-span-8 min-w-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 space-x-2">
        <CardTitle>Últimas Movimentações</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
          className={
            isEditing ? "text-primary bg-muted" : "text-muted-foreground"
          }
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                {isEditing && <TableHead className="w-[50px]">Ações</TableHead>}
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
                  {isEditing && (
                    <TableCell className="py-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => confirmDelete(transaction.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
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
        </div>
      </CardContent>
      {/* Componente do Modal (Fica invisível até ser acionado) */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a
              transação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Transaction } from "@/types";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Pencil,
  Trash,
  Utensils,
  Repeat,
  Beer,
  Home,
  GraduationCap,
  Gamepad2,
  ShoppingBasket,
  HeartPulse,
  Car,
  Plane,
  Scissors,
  MoreHorizontal,
  Landmark,
  TrendingUp,
  Shirt,
  Check,
  X,
} from "lucide-react";

interface TransactionListProps {
  transacoes: Transaction[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  limit?: number;
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  Alimentação: <Utensils className="h-4 w-4" />,
  Assinaturas: <Repeat className="h-4 w-4" />,
  "Bares e Restaurantes": <Beer className="h-4 w-4" />,
  Casa: <Home className="h-4 w-4" />,
  Educação: <GraduationCap className="h-4 w-4" />,
  Investimento: <TrendingUp className="h-4 w-4" />,
  Lazer: <Gamepad2 className="h-4 w-4" />,
  Mercado: <ShoppingBasket className="h-4 w-4" />,
  Saúde: <HeartPulse className="h-4 w-4" />,
  Transporte: <Car className="h-4 w-4" />,
  Vestuário: <Shirt className="h-4 w-4" />,
  Viagem: <Plane className="h-4 w-4" />,
  Beleza: <Scissors className="h-4 w-4" />,
  Outros: <MoreHorizontal className="h-4 w-4" />,
  Banco: <Landmark className="h-4 w-4" />,
};

function groupTransactionsByMonth(transactions: Transaction[]) {
  const groups: { [key: string]: Transaction[] } = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const monthYear = date.toLocaleString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    // Capitalize first letter
    const formattedMonthYear =
      monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

    if (!groups[formattedMonthYear]) {
      groups[formattedMonthYear] = [];
    }
    groups[formattedMonthYear].push(transaction);
  });

  return groups;
}

export function TransactionList({
    transacoes,
    onDelete,
    onUpdate,
    limit,
  }: TransactionListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Estado para edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "",
    date: "",
    type: "expense" as "income" | "expense"
  });

  /* Limpeza de estado movida para os handlers de toggle */

  const startEditing = (t: Transaction) => {
    setEditingId(t.id);
    setEditForm({
      description: t.description,
      amount: t.amount.toString(),
      category: t.category,
      date: t.date.split('T')[0],
      type: t.type
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ description: "", amount: "", category: "", date: "", type: "expense" });
  };

  const saveEditing = async (id: string) => {
    try {
        await onUpdate(id, {
            description: editForm.description,
            amount: Number(editForm.amount),
            category: editForm.category,
            date: new Date(editForm.date).toISOString(),
            type: editForm.type
        });
        setEditingId(null);
    } catch (error) {
        console.error("Erro ao atualizar", error);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const toggleEditingMode = () => {
    const newState = !isEditing;
    setIsEditing(newState);
    if (!newState) setEditingId(null);
  };

  const toggleModalEditingMode = () => {
    const newState = !isEditingModal;
    setIsEditingModal(newState);
    if (!newState) setEditingId(null);
  };

  const displayedTransactions = limit ? transacoes.slice(0, limit) : transacoes;
  const showViewAll = limit && transacoes.length > limit;

  // Renderiza uma tabela de transações (reutilizável para a lista principal e para os grupos do modal)
  const renderTable = (data: Transaction[], isEditingResult: boolean) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead className="w-[50px] md:w-auto text-center md:text-left">
            <span className="md:hidden">Cat.</span>
            <span className="hidden md:inline">Categoria</span>
          </TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          {isEditingResult && <TableHead className="w-[50px]">Ações</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((transaction) => (
          <TableRow key={transaction.id}>
            {editingId === transaction.id ? (
              // MODO EDIÇÃO
              <>
                <TableCell>
                  <Input 
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  />
                </TableCell>
                <TableCell>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  >
                    {Object.keys(categoryIcons).sort().map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                   <Input 
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                  />
                </TableCell>
                <TableCell>
                   <Input 
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                  />
                </TableCell>
                <TableCell className="py-0 flex items-center gap-2">
                   <Button variant="ghost" size="icon-sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => saveEditing(transaction.id)}>
                      <Check className="h-4 w-4" />
                   </Button>
                   <Button variant="ghost" size="icon-sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={cancelEditing}>
                      <X className="h-4 w-4" />
                   </Button>
                </TableCell>
              </>
            ) : (
                // MODO VISUALIZAÇÃO (Original)
              <>
            <TableCell className="font-medium">
              {transaction.description.length > 15 ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <span className="cursor-pointer hover:underline decoration-dashed underline-offset-4">
                      {transaction.description.substring(0, 15) + "..."}
                    </span>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2 text-sm z-50">
                    {transaction.description}
                  </PopoverContent>
                </Popover>
              ) : (
                transaction.description
              )}
            </TableCell>
            <TableCell
              className="text-center md:text-left"
              title={transaction.category}
            >
              <div className="md:hidden flex justify-center items-center h-8">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-transparent"
                    >
                      {categoryIcons[transaction.category] || (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2 text-sm z-50">
                    {transaction.category}
                  </PopoverContent>
                </Popover>
              </div>
              <span className="hidden md:inline">{transaction.category}</span>
            </TableCell>
            <TableCell>
              {new Date(transaction.date).toLocaleDateString("pt-BR")}
            </TableCell>
            <TableCell
              className={`text-right ${
                transaction.type === "income"
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {transaction.type === "expense" ? "- " : "+ "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(transaction.amount)}
            </TableCell>
            {isEditingResult && (
              <TableCell className="py-0 flex items-center gap-1">
                 <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => startEditing(transaction)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
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
            </>
            )}
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={isEditingResult ? 5 : 4}
              className="text-center text-muted-foreground h-24"
            >
              Nenhuma transação registrada.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <Card className="md:col-span-8 min-w-0 flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 space-x-2">
        <CardTitle>Últimas Movimentações</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleEditingMode}
          className={
            isEditing ? "text-primary bg-muted" : "text-muted-foreground"
          }
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          {renderTable(displayedTransactions, isEditing)}
        </div>

        {showViewAll && (
          <div className="mt-4 flex justify-center border-t pt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Ver todas as movimentações
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-[95vw] sm:max-w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center gap-4 pr-10">
                  <DialogTitle>Histórico de Transações</DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleModalEditingMode}
                    className={
                      isEditingModal
                        ? "text-primary bg-muted"
                        : "text-muted-foreground"
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogHeader>
                <div className="space-y-8 mt-4">
                  {Object.entries(groupTransactionsByMonth(transacoes)).map(
                    ([month, groupTransacoes]) => (
                      <div key={month} className="space-y-2">
                        <h3 className="font-semibold text-lg text-primary sticky top-0 bg-background py-2 z-10">
                          {month}
                        </h3>
                        {renderTable(groupTransacoes, isEditingModal)}
                      </div>
                    )
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>

      {/* Componente do Modal de Exclusão */}
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseLocalDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
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
    const date = parseLocalDate(transaction.date);
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
  
  // Estado para edição via modal
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "",
    date: "",
    type: "expense" as "income" | "expense"
  });

  const formatAmountToCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setEditForm({
      description: t.description,
      amount: formatAmountToCurrency(Number(t.amount)),
      category: t.category,
      date: t.date.split('T')[0],
      type: t.type
    });
  };

  const closeEditModal = () => {
    setEditingTransaction(null);
    setEditForm({ description: "", amount: "", category: "", date: "", type: "expense" });
  };

  const handleEditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/\D/g, "");
    if (!cleanValue) {
      setEditForm({...editForm, amount: ""});
      return;
    }
    const numericValue = Number(cleanValue) / 100;
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericValue);
    setEditForm({...editForm, amount: formatted});
  };

  const saveEditing = async () => {
    if (!editingTransaction) return;
    // Converte "R$ 1.200,50" de volta para 1200.50
    const numericAmount = Number(editForm.amount.replace(/\D/g, "")) / 100;
    try {
        await onUpdate(editingTransaction.id, {
            description: editForm.description,
            amount: numericAmount,
            category: editForm.category,
            date: editForm.date,
            type: editForm.type
        });
        closeEditModal();
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
      closeEditModal();
    }
  };

  const toggleEditingMode = () => {
    const newState = !isEditing;
    setIsEditing(newState);
  };

  const toggleModalEditingMode = () => {
    const newState = !isEditingModal;
    setIsEditingModal(newState);
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
          <TableHead className="text-right">
            <span className="md:hidden">R$</span>
            <span className="hidden md:inline">Valor</span>
          </TableHead>
          {isEditingResult && <TableHead className="w-[50px]">Ações</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((transaction) => (
          <TableRow key={transaction.id}>
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
            <TableCell className="whitespace-nowrap">
              {/* Desktop (md+): dd/mm/aaaa */}
              <span className="hidden md:inline">
                {parseLocalDate(transaction.date).toLocaleDateString("pt-BR")}
              </span>
              {/* Mobile (sm): dd/mm/aa */}
              <span className="hidden sm:inline md:hidden">
                {parseLocalDate(transaction.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
              </span>
              {/* Tela pequena (< sm): dd/mm */}
              <span className="sm:hidden">
                {parseLocalDate(transaction.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
              </span>
            </TableCell>
            <TableCell
              className={`text-right whitespace-nowrap ${
                transaction.type === "income"
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {/* Desktop: com R$ */}
              <span className="hidden md:inline">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(transaction.amount)}
              </span>
              {/* Mobile: sem R$ */}
              <span className="md:hidden">
                {new Intl.NumberFormat("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(transaction.amount)}
              </span>
            </TableCell>
            {isEditingResult && (
              <TableCell className="py-0 flex items-center gap-1">
                 <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => openEditModal(transaction)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
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

      {/* Modal de Edição */}
      <Dialog open={!!editingTransaction} onOpenChange={(open) => { if (!open) closeEditModal(); }}>
        <DialogContent className="w-[95vw] max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Valor</Label>
                <Input
                  id="edit-amount"
                  type="text"
                  placeholder="R$ 0,00"
                  value={editForm.amount}
                  onChange={handleEditAmountChange}
                  maxLength={18}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo</Label>
                <select
                  id="edit-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editForm.type}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value as "income" | "expense"})}
                >
                  <option value="expense">Saída</option>
                  <option value="income">Entrada</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoria</Label>
                <select
                  id="edit-category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                >
                  {Object.keys(categoryIcons).sort().map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Data</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
            <Button
              variant="destructive"
              onClick={() => editingTransaction && confirmDelete(editingTransaction.id)}
              className="sm:mr-auto"
            >
              <Trash className="h-4 w-4 mr-2" />
              Excluir
            </Button>
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <Button variant="outline" onClick={closeEditModal}>
                Cancelar
              </Button>
              <Button onClick={saveEditing}>
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
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

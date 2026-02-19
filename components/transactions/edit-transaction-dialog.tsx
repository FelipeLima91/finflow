import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TRANSACTION_CATEGORIES } from "@/lib/constants";
import { Transaction } from "@/types";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: Partial<Transaction>) => Promise<void>;
  onDelete: (id: string) => void;
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: EditTransactionDialogProps) {
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "",
    date: "",
    type: "expense" as "income" | "expense",
  });

  useEffect(() => {
    if (transaction) {
      setEditForm({
        description: transaction.description,
        amount: formatAmountToCurrency(Number(transaction.amount)),
        category: transaction.category,
        date: transaction.date.split("T")[0],
        type: transaction.type,
      });
    } else {
        // Reset form when closed/no transaction
        setEditForm({ description: "", amount: "", category: "", date: "", type: "expense" });
    }
  }, [transaction, open]);

  const formatAmountToCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleEditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/\D/g, "");
    if (!cleanValue) {
      setEditForm({ ...editForm, amount: "" });
      return;
    }
    const numericValue = Number(cleanValue) / 100;
    const formatted = formatAmountToCurrency(numericValue);
    setEditForm({ ...editForm, amount: formatted });
  };

  const handleSave = async () => {
    if (!transaction) return;
    const numericAmount = Number(editForm.amount.replace(/\D/g, "")) / 100;
    try {
      await onSave(transaction.id, {
        description: editForm.description,
        amount: numericAmount,
        category: editForm.category,
        date: editForm.date,
        type: editForm.type,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-[450px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Input
              id="edit-description"
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
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
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    type: e.target.value as "income" | "expense",
                  })
                }
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
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
              >
                {TRANSACTION_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
          <Button
            variant="destructive"
            onClick={() => transaction && onDelete(transaction.id)}
            className="sm:mr-auto"
          >
            <Trash className="h-4 w-4 mr-2" />
            Excluir
          </Button>
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

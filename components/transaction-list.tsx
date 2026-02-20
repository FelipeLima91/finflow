import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { parseLocalDate } from "@/lib/utils";
import { Transaction } from "@/types";
import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { DeleteTransactionDialog } from "./transactions/delete-transaction-dialog";
import { EditTransactionDialog } from "./transactions/edit-transaction-dialog";
import { TransactionTable } from "./transactions/transaction-table";

interface TransactionListProps {
  transacoes: Transaction[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  limit?: number;
}

export function TransactionList({
  transacoes,
  onDelete,
  onUpdate,
  limit,
}: TransactionListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Estado para confirmação de exclusão (separado para não depender apenas do modal de edição)
  // Mas no design atual, a exclusão vem de dentro do modal de edição.
  // Vou manter um estado de deleteId caso queira chamar direto de algum lugar, ou via callback do EditModal
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Otimização: Agrupamento memoizado
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    transacoes.forEach((transaction) => {
      const date = parseLocalDate(transaction.date);
      const monthYear = date.toLocaleString("pt-BR", {
        month: "long",
        year: "numeric",
      });
      const formattedMonthYear =
        monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

      if (!groups[formattedMonthYear]) {
        groups[formattedMonthYear] = [];
      }
      groups[formattedMonthYear].push(transaction);
    });
    return groups;
  }, [transacoes]);

  const displayedTransactions = limit ? transacoes.slice(0, limit) : transacoes;
  const showViewAll = limit && transacoes.length > limit;

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
  };

  const handleDeleteFromModal = (id: string) => {
    setDeleteId(id);
    // Não fecha o modal de edição imediatamente visivelmente, pois vai abrir o de confirmação em cima?
    // O ideal é fechar o de edição se confirmar. Vamos ver o fluxo.
    // EditTransactionDialog chama onDelete -> setDeleteId -> Abre ConfirmDialog.
    // ConfirmDialog confirma -> onConfirmDelete -> Deleta e fecha tudo.
  };

  const onConfirmDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
      setEditingTransaction(null);
    }
  };

  return (
    <div className="min-w-0 flex flex-col h-full">
      <div className="flex flex-row items-center justify-between space-x-2 mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Últimas Movimentações</h2>
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
      </div>
      <div className="flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <TransactionTable
            transactions={displayedTransactions}
            isEditing={isEditing}
            onEdit={openEditModal}
          />
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
                    onClick={() => setIsEditingModal(!isEditingModal)}
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
                  {Object.entries(groupedTransactions).map(
                    ([month, groupTransacoes]) => (
                      <div key={month} className="space-y-2">
                        <h3 className="font-semibold text-lg text-primary sticky top-0 bg-background py-2 z-10">
                          {month}
                        </h3>
                        <TransactionTable
                          transactions={groupTransacoes}
                          isEditing={isEditingModal}
                          onEdit={openEditModal}
                        />
                      </div>
                    )
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <EditTransactionDialog
        transaction={editingTransaction}
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        onSave={onUpdate}
        onDelete={handleDeleteFromModal}
      />

      <DeleteTransactionDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}

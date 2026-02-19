import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CATEGORY_ICONS } from "@/lib/constants";
import { parseLocalDate } from "@/lib/utils";
import { Transaction } from "@/types";
import { MoreHorizontal, Pencil } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  isEditing: boolean;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionTable({
  transactions,
  isEditing,
  onEdit,
}: TransactionTableProps) {
  return (
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
          {isEditing && <TableHead className="w-[50px]">Ações</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
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
                      {CATEGORY_ICONS[transaction.category] || (
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
                {parseLocalDate(transaction.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </span>
              {/* Tela pequena (< sm): dd/mm */}
              <span className="sm:hidden">
                {parseLocalDate(transaction.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
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
            {isEditing && (
              <TableCell className="py-0 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => onEdit(transaction)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
        {transactions.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={isEditing ? 5 : 4}
              className="text-center text-muted-foreground h-24"
            >
              Nenhuma transação registrada.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

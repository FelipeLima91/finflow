"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { TRANSACTION_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


interface NewTransactionFormProps {
  onSave: (dados: any) => Promise<void>;
}

export function NewTransactionForm({ onSave }: NewTransactionFormProps) {
  const [amount, setAmount] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [category, setCategory] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState<"entrada" | "saida">("saida");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Seleciona categorias baseado no tipo de transação
  // EDIT: Usando lista unificada por enquanto, ou filtrar se necessário
  // const activeCategories = type === "entrada" ? incomeCategories : expenseCategories;
  const activeCategories = TRANSACTION_CATEGORIES;

  // Limpa categoria ao trocar tipo
  React.useEffect(() => {
    setCategory("");
  }, [type]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const cleanValue = value.replace(/\D/g, "");

    if (!cleanValue) {
      setAmount("");
      return;
    }

    const numericValue = Number(cleanValue) / 100;
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericValue);

    setAmount(formatted);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Impede a página de piscar/recarregar

    if (!description || !amount || !category) return; // Validação básica

    setIsSubmitting(true);

    // TRUQUE DO DINHEIRO: O banco quer número (1200.50), mas a tela tem texto (R$ 1.200,50)
    // Essa linha remove tudo que não é número e divide por 100
    const numericAmount = Number(amount.replace(/\D/g, "")) / 100;

    const now = new Date();
    // Formata a data LOCAL para evitar o bug de fuso horário com toISOString()
    // toISOString() converte para UTC, o que pode mudar o dia (ex: 00:55 BRT → dia anterior em UTC)
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    console.log("Enviando data local:", localDate);

    // Chama a função do Pai enviando os dados limpos
    await onSave({
      description,
      amount: numericAmount,
      category,
      type: type === "entrada" ? "income" : "expense", // Traduz português -> inglês pro banco
      date: localDate,
    });

    // Limpa tudo depois de salvar
    setDescription("");
    setAmount("");
    setCategory("");
    setType("saida");
    setIsSubmitting(false);
  }

  // Comportamento do Combobox:
  // Se o usuário digitou algo que não existe na lista, oferecemos criar.
  // O filtro do Command cuida de mostrar os que dão match.
  // Se não der match em nada, o CommandEmpty aparece.

  return (
    <Card className="md:col-span-4 h-fit min-w-0">
      <CardHeader>
        <CardTitle>Nova Transação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              placeholder="Ex: Mercado, Luz..."
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="text"
                placeholder="R$ 0,00"
                value={amount || ""}
                onChange={handleAmountChange}
                maxLength={18}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={type}
                onChange={(e) => setType(e.target.value as "entrada" | "saida")}
              >
                <option value="saida">Saída</option>
                <option value="entrada">Entrada</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label>Categoria</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="justify-between"
                >
                  {category ? category : "Selecione uma categoria..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Buscar categoria..."
                    onValueChange={(val) => setInputValue(val)}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <button
                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        onClick={() => {
                          setCategory(inputValue);
                          setOpen(false);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Criar "{inputValue}"
                      </button>
                    </CommandEmpty>
                    <CommandGroup>
                      {TRANSACTION_CATEGORIES.map((item) => (
                        <CommandItem
                          key={item}
                          value={item}
                          onSelect={(currentValue) => {
                            // o onSelect do CommandItem retorna tudo minúsculo
                            // mas aqui queremos usar o valor display original se bater,
                            // ou o valor, mas aqui como a lista é fixa, podemos pegar o item original
                            setCategory(item);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              category === item ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {item}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !description || !amount || !category}
            className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

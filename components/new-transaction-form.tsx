"use client";

import * as React from "react";
import { ArrowDownCircle, ArrowUpCircle, Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { categoriesForType } from "@/lib/constants";
import { Button } from "@/components/ui/button";

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

/** "YYYY-MM-DD" de hoje, em horário LOCAL (toISOString() converteria pra UTC). */
function todayLocal(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

export function NewTransactionForm({ onSave }: NewTransactionFormProps) {
  const [amount, setAmount] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [category, setCategory] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState<"entrada" | "saida">("saida");
  const [date, setDate] = React.useState(todayLocal());
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Entrada e saída têm listas de categoria diferentes ("Bares e Restaurantes"
  // não faz sentido como entrada, "Salário" não faz sentido como saída).
  const activeCategories = categoriesForType(type === "entrada" ? "income" : "expense");

  /**
   * Ao trocar de aba, só limpa a categoria se ela não existir no novo tipo.
   * Categorias comuns aos dois (Investimento, Banco, Outros) são preservadas.
   */
  const handleTypeChange = (next: "entrada" | "saida") => {
    setType(next);
    const nextCategories = categoriesForType(next === "entrada" ? "income" : "expense");
    if (category && !nextCategories.includes(category)) {
      setCategory("");
    }
  };

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

    // Usa a data escolhida pelo usuário (permite lançamento retroativo) com a
    // hora atual, para manter a ordenação estável dentro de um mesmo dia.
    // Tudo em horário LOCAL: toISOString() converteria pra UTC e poderia mudar
    // o dia (ex: 00:55 BRT viraria o dia anterior).
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const localDate = `${date}T${time}`;

    // Chama a função do Pai enviando os dados limpos
    await onSave({
      description,
      amount: numericAmount,
      category,
      type: type === "entrada" ? "income" : "expense", // Traduz português -> inglês pro banco
      date: localDate,
    });

    // Limpa tudo depois de salvar (a data volta pra hoje)
    setDescription("");
    setAmount("");
    setCategory("");
    setType("saida");
    setDate(todayLocal());
    setIsSubmitting(false);
  }

  // Comportamento do Combobox:
  // Se o usuário digitou algo que não existe na lista, oferecemos criar.
  // O filtro do Command cuida de mostrar os que dão match.
  // Se não der match em nada, o CommandEmpty aparece.

  return (
    <div className="h-fit min-w-0">
      <h2 className="text-lg font-semibold text-foreground mb-4">Nova Transação</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seletor de tipo em abas — evita abrir um dropdown só pra isso */}
          <div
            role="radiogroup"
            aria-label="Tipo de transação"
            className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
          >
            <button
              type="button"
              role="radio"
              aria-checked={type === "saida"}
              onClick={() => handleTypeChange("saida")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                type === "saida"
                  ? "bg-card text-expense shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowDownCircle className="h-4 w-4" />
              Saída
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={type === "entrada"}
              onClick={() => handleTypeChange("entrada")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                type === "entrada"
                  ? "bg-card text-income shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowUpCircle className="h-4 w-4" />
              Entrada
            </button>
          </div>

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
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={date}
                max={todayLocal()}
                onChange={(e) => setDate(e.target.value)}
              />
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
                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
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
                      {activeCategories.map((item) => (
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
            size="lg"
            disabled={isSubmitting || !description || !amount || !category}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </form>
    </div>
  );
}

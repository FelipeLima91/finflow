import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowDownCircle, ArrowUpCircle, DollarSign, Plus } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              FinFlow
            </h1>
            <p className="text-zinc-500">
              Controle financeiro simples e eficiente.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Olá, Família</span>
            <div className="h-8 w-8 rounded-full bg-zinc-200"></div>
          </div>
        </div>

        {/* CARDS DE RESUMO */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                R$ 4.250,00
              </div>
              <p className="text-xs text-muted-foreground">
                +20.1% em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saídas</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">
                R$ 1.890,00
              </div>
              <p className="text-xs text-muted-foreground">
                +4% em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <DollarSign className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">
                R$ 2.360,00
              </div>
              <p className="text-xs text-muted-foreground">
                Disponível para uso
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ÁREA PRINCIPAL: FORMULÁRIO E TABELA */}
        <div className="grid gap-8 md:grid-cols-12">
          {/* COLUNA DA ESQUERDA: NOVA TRANSAÇÃO */}
          <Card className="md:col-span-4 h-fit">
            <CardHeader>
              <CardTitle>Nova Transação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input id="descricao" placeholder="Ex: Mercado, Luz..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor</Label>
                  <Input id="valor" type="number" placeholder="0,00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="saida">Saída</option>
                    <option value="entrada">Entrada</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input id="categoria" placeholder="Ex: Alimentação" />
              </div>

              <Button className="w-full bg-zinc-900 hover:bg-zinc-800">
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </CardContent>
          </Card>

          {/* COLUNA DA DIREITA: HISTÓRICO */}
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
        </div>
      </div>
    </main>
  );
}

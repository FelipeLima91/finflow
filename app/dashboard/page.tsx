'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { parseLocalDate } from "@/lib/utils"
import { Transaction } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Paleta coesa puxando pro azul de marca (alinhada ao design system)
const COLORS = ['#2563eb', '#0891b2', '#7c3aed', '#10b981', '#f59e0b', '#ec4899']

export default function DashboardPage() {
  const [transacoes, setTransacoes] = useState<Transaction[]>([])

  // Busca os dados (igualzinho a home)
  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from("transactions").select('*')
      setTransacoes((data as Transaction[]) || [])
    }
    fetchData()
  }, [])

  // --- LÓGICA DO GRÁFICO DE PIZZA (Gastos por Categoria) ---
  const dadosPizza = transacoes
    .filter(t => t.type === 'expense') // Só queremos despesas
    .reduce((acc, curr) => {
      // Procura se a categoria já existe no acumulador
      const found = acc.find(item => item.name === curr.category)
      if (found) {
        found.value += Number(curr.amount)
      } else {
        acc.push({ name: curr.category, value: Number(curr.amount) })
      }
      return acc
    }, [] as { name: string, value: number }[])

  // --- LÓGICA DO GRÁFICO DE BARRAS (Gastos por Dia) ---
  // Pega os últimos 7 dias ou agrupa tudo
  const dadosBarras = transacoes
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      // Formata a data para "Dia/Mês" (ex: 18/01)
      const dataFormatada = parseLocalDate(curr.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      
      const found = acc.find(item => item.name === dataFormatada)
      if (found) {
        found.total += Number(curr.amount)
      } else {
        acc.push({ name: dataFormatada, total: Number(curr.amount) })
      }
      return acc
    }, [] as { name: string, total: number }[])
    // Ordena por data (opcional, mas bom pra timeline)
    .reverse() 

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Cabeçalho com botão de voltar */}
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-accent text-foreground rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Relatórios & Gráficos</h1>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          
          {/* GRÁFICO 1: PIZZA (Categorias) */}
          <Card>
            <CardHeader>
              <CardTitle>Para onde vai meu dinheiro?</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {dadosPizza.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPizza}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                    >
                      {dadosPizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Sem dados de despesas ainda.
                </div>
              )}
            </CardContent>
          </Card>

          {/* GRÁFICO 2: BARRAS (Por Dia) */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Dia</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {dadosBarras.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosBarras}>
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(value) => `R$${value}`}/>
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Gasto']} />
                    <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Sem dados de despesas ainda.
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  )
}
export function Header() {
  return (
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
  )
}

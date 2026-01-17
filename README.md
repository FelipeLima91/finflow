v1. O "Cérebro" e a "Cara" (Frontend + Backend)
Aqui é onde a mágica acontece: o que você vê na tela e as regras matemáticas (soma, subtração).

Tecnologia: Next.js (versão mais recente).

Linguagem: TypeScript.

Por que: É a linguagem padrão do mercado hoje. O TypeScript é vital para financeiro porque ele bloqueia erros bobos (como tentar somar "dez reais" com o número 10).

Onde vive a lógica: No próprio Next.js. Antigamente, separava-se o site (Front) da lógica (Back). O Next.js une os dois. Isso simplifica tudo: menos arquivos, menos configurações.

2. A "Maquiagem" (Estilo e Design)
   É o que vai garantir que fique "bonitinho" e profissional sem você precisar ser um designer formado.

Tecnologia: Tailwind CSS + Shadcn/UI.

Como funciona: Em vez de desenhar um botão do zero (tamanho, cor, borda, sombra), você usa o Shadcn que já te dá componentes prontos e elegantes (estilo Apple/Google). É copiar, colar e usar.

3. A "Memória" (Banco de Dados e Login)
   Onde os dados ficam guardados para não sumirem quando você fecha a janela.

Tecnologia: Supabase.

O Banco de Dados: Usa PostgreSQL. É o banco mais robusto e seguro do mundo open-source. Perfeito para lidar com dinheiro.

O Login (Autenticação): O próprio Supabase gerencia isso. Você não precisa programar a segurança da senha, criptografia, etc. Ele já te entrega pronto.

Sua estratégia: Você criará um único usuário no painel do Supabase. Você e sua família usarão esse mesmo email e senha para entrar.

4. A "Casa" (Hospedagem/Deploy)
   Onde o site fica ligado 24h por dia para você acessar do celular na rua.

Plataforma: Vercel.

Conexão: Ela se conecta direto no seu código. Salvou o código no computador -> O site atualiza sozinho na internet em 1 minuto.

A Garantia de Custo Zero (Como não pagar nada?)
Muitas empresas oferecem planos gratuitos ("Hobby Tier") para atrair desenvolvedores. Para o uso de uma família, é impossível estourar esses limites. Veja os detalhes:

Vercel (Hospedagem):

Custo: R$ 0,00 para projetos não comerciais.

Limite: O site sai do ar se tiver milhões de acessos. Como são apenas 2 pessoas usando, você está 99,9% longe do limite.

Supabase (Banco de Dados):

Custo: R$ 0,00 no plano Free.

Limite: 500MB de dados.

Na prática: Dados de texto (gastos, descrições) ocupam bytes. Você precisaria lançar milhares de gastos por dia durante anos para encher 500MB.

GitHub (Onde fica o código):

Custo: R$ 0,00 para repositórios públicos ou privados.

Resumo da Segurança (Código Aberto vs. Dados Privados)
Como você quer deixar o código aberto (Open Source) para outros aprenderem, a estrutura é esta:

O Código (Público): A "receita do bolo" fica no GitHub. Todo mundo vê como o site é feito, onde ficam os botões, como a conta de somar é feita.

As Chaves (Privadas): As senhas de acesso ao banco ("variáveis de ambiente") ficam escondidas apenas na Vercel (o site de hospedagem).

O Resultado: Se um estranho baixar seu código, ele terá um site "oco". Ele não consegue ver seus gastos porque ele não tem a chave que conecta no seu banco de dados Supabase.

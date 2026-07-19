-- FinFlow — Adicionar uma pessoa à conta conjunta
--
-- PRÉ-REQUISITO: criar o usuário dela no painel do Supabase em
--   Authentication -> Users -> "Add user" -> Create new user
--   (preencha email + senha e marque "Auto Confirm User")
--
-- Depois, troque os emails abaixo e rode este script no SQL Editor.

-- 1. Adiciona a pessoa na mesma household que já existe
insert into public.household_members (household_id, user_id, role)
select
  (select id from public.households order by created_at limit 1),
  u.id,
  'member'
from auth.users u
where u.email = 'EMAIL_DA_ESPOSA@exemplo.com'   -- <<< TROQUE AQUI
on conflict do nothing;

-- 2. Nomes amigáveis (aparecem na coluna "Quem" da tabela)
update public.profiles set display_name = 'Felipe'
  where email = 'SEU_EMAIL@exemplo.com';         -- <<< TROQUE AQUI

update public.profiles set display_name = 'Esposa'
  where email = 'EMAIL_DA_ESPOSA@exemplo.com';   -- <<< TROQUE AQUI

-- 3. Confirma que deu certo — deve listar as 2 pessoas na mesma household
select h.name as conta, p.display_name, p.email, hm.role
from public.household_members hm
join public.households h on h.id = hm.household_id
join public.profiles   p on p.id = hm.user_id
order by hm.created_at;

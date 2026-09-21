# ApaixoneSe-Front

Instruções agnósticas de ferramenta. Backend em `../ApaixoneSe-Back` (NestJS, API sob `/api`).

## Stack

- Next.js 14 (App Router), React 18, TypeScript, Tailwind 3, framer-motion, lucide-react, react-hot-toast
- Sem lib de formulário: `useState` + validação nativa HTML
- Dados: `apiFetch` em `src/lib/api/config`, um módulo por recurso em `src/lib/api/*`; auth via `useAuth()` (`@/context/AuthContext`)
- Sem framework de testes no Front

## Comandos

- `npm run dev` (porta 3304), `npm run build`, `npm run start`
- Tipos: `npx tsc --noEmit` (não commitar o `tsconfig.tsbuildinfo` alterado)

## Convenções

- Branch por escopo (`feat/...`, `fix/...`); nunca commitar direto em `main`; commits por unidade lógica
- Nunca commitar `.env*` (só `.env.example`)

## Planeje sua Viagem (`src/components/planeje-sua-viagem/`)

- Entradas: `hero-section.tsx` (modal via `PlanejeSuaViagemTrigger`) e `app/perfil/page.tsx`; ambas renderizam `PlanoViagemList`
- Criar plano: `PlanoViagemForm` já monta os itens como rascunho (`ItemPlanoForm` em modo rascunho, sem `planoViagemId`) e envia tudo em um único `POST /plano-viagem`
- `ItemPlanoForm` com `planoViagemId` = modo persistido (usado pelo card de plano existente)
- `ItemPlanoForm` é um `<form>`: nunca aninhar dentro de outro `<form>` (por isso o submit de `PlanoViagemForm` usa o atributo `form=`)
- Item deve cair dentro de `dataInicio`–`dataFim` (Front exato em horário local; Back com folga de fuso)

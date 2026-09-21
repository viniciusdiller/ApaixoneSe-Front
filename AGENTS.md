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
- Criar plano: `PlanoViagemForm` é um único `<form>`; cada item é uma linha editável (`ItemPlanoRow`) e tudo vai em um único `POST /plano-viagem`. Sem sub-formulário nem etapa intermediária
- `ItemPlanoForm` = adicionar item a plano já existente (card); `lugares.ts` concentra categorias, carga das opções e o filtro por período
- Eventos só aparecem se ocorrem dentro do período do plano (`opcoesNoPeriodo`); a data do evento segue a convenção do site (`data.slice(0, 10)`)
- Erros do backend: `mensagemDeErro` mostra a mensagem de negócio e cai num texto genérico para erro técnico (detalhe no console)
- Item deve cair dentro de `dataInicio`–`dataFim` (Front exato em horário local; Back com folga de fuso)

# Lex: landing page

Landing page do Lex (o produto do monorepo `red`). A estrutura, o visual e as animações partem de uma engenharia reversa de [getartcraft.com/apps](https://getartcraft.com/apps), adaptada à marca, ao tom e às funcionalidades do Lex. As telas são capturas do frontend real do `red`, rodando contra uma API fictícia.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check e build de produção, em dist/
```

Stack: React 19, Vite 8, TypeScript 6 e Tailwind CSS 4 (a mesma do `red/frontend`), mais **GSAP** com ScrollTrigger e **Lenis**, as mesmas bibliotecas de movimento da referência. As fontes (Archivo, Inter e JetBrains Mono) são servidas pelo próprio site, sem requisições a terceiros.

## Antes de publicar

- **E-mail de contato:** troque `CONTACT_EMAIL` em [src/content.ts](src/content.ts). Hoje é `contato@lex.example`, um endereço de exemplo que não existe. Os botões "Solicitar demonstração" abrem o e-mail com ele.
- **Confira as afirmações** de [src/content.ts](src/content.ts) com o time. O `backend/README.md` do red lista como pendente a validação com respostas reais da SEFAZ (distribuição de NF-e, CT-e e MDF-e e SAE-NFC-e), e o card "Documentos fiscais" cita a SEFAZ.
- Conciliação, Divergências e Trilha de auditoria aparecem só como "A caminho", sem data, porque no menu do produto estão como "Em breve".

## Estrutura

```
src/
  content.ts            textos, módulos (nome, cor, frase e captura) e princípios: edite aqui para mudar a copy
  motion.ts             rolagem suave (Lenis), introdução e entradas por seção (GSAP + ScrollTrigger)
  index.css             tokens do tema, rótulos, botões e pré-ocultação dos blocos animados
  components/           Nav, Ruler (régua lateral), SectionIndex (título da seção), Hero, Modules, Principles, Cta, Footer
public/
  shots/                capturas do app (webp, 2400x1500), uma por módulo
  lex-icon.png, favicon.png, alegoria-justica.webp   marca, copiados de red/frontend
tools/screenshots/      pipeline que gera as capturas (abaixo)
```

## Movimento

Tudo isso segue a referência e só liga quando o sistema não pede movimento reduzido (`prefers-reduced-motion`). Com movimento reduzido nada é escondido, e a rolagem é a nativa.

- **Rolagem suave:** Lenis com `lerp: 0.12`, ligado ao ticker do GSAP. Âncoras (`#modulos`) também rolam suave.
- **Introdução:** o menu entra de cima em sequência e a régua monta as marcas a partir de 0,7 s; o texto do hero entra a partir de 1,05 s. Rolar, clicar ou teclar acelera 4× em vez de cortar.
- **Entrada por bloco** (`data-reveal`): sai de `blur(8px)` e 28 px abaixo para nítido em 0,9 s (`power3.out`). Em grupos (`data-reveal-group`), como a grade de cards, cada item atrasa conforme a posição horizontal.
- **Topo de cada seção** (`data-choreo`): a linha desenha da esquerda em 0,7 s, o rótulo "0N / ..." sai do desfoque e as cruzes dos cantos escalam em sequência.
- **Régua lateral:** substitui a barra de rolagem (a nativa some em telas largas). A agulha acompanha o progresso, a leitura gira como odômetro, passar o mouse mostra o ponto alvo, clicar salta com rolagem suave e arrastar percorre a página.
- **Título da seção:** as anteriores ficam pequenas em cima, a atual grande e as próximas pequenas embaixo; ao trocar de seção, as letras da nova entram em sequência.
- **Cards:** no hover, uma linha da cor do módulo varre o topo, o ícone sobe e a captura dá zoom.

## Regenerar as telas

As capturas vêm do frontend real do `red`, apontado para uma API fictícia (empresa, CNPJ, banco, clientes e valores inventados). Assim nenhum dado de cliente entra em material público, e o resultado é reproduzível: o relógio da página é congelado em 29/10/2026.

Com o repositório `red` ao lado desta pasta (ou `RED_FRONTEND_DIR` apontando para `red/frontend`, com `npm install` feito), em três terminais:

```bash
npm run shots:api   # API fictícia em http://127.0.0.1:5999
npm run shots:app   # frontend do red em http://127.0.0.1:5174, usando a API fictícia
npm run shots       # fotografa as telas com o Edge ou o Chrome (BROWSER_PATH para outro caminho)
```

`npm run shots -- dre extratos` fotografa só as telas citadas. A lista de telas e os cliques de preparo ficam em [tools/screenshots/capture.mjs](tools/screenshots/capture.mjs). Se o formato de uma resposta da API do red mudar, ajuste [tools/screenshots/mock-api.mjs](tools/screenshots/mock-api.mjs), que segue os tipos de `red/frontend/src/features/*Api.ts`.

O `.claude/launch.json` traz as mesmas três configurações (`lex-landing`, `lex-mock-api` e `lex-app`) para o painel de preview do Claude Code.

## Como a referência foi adaptada

| Referência (ArtCraft Crafting Apps) | Lex |
| --- | --- |
| "Thirteen apps. One craft." | "Nove módulos. Uma só contabilidade." |
| Grade de ícones coloridos dos 13 apps | Grade dos 9 módulos, cada um num bloco de cor sólida |
| Lineup: cards com captura, ícone, nome em duas cores, tag e "Explore" | 9 cards iguais, com a cor de cada módulo; clicar abre a tela ampliada |
| "Next up": o que vem depois | "A caminho": Conciliação, Divergências e Trilha de auditoria, numa linha |
| "Built the hard way": 6 princípios | "Construído para conferir": 6 princípios, uma frase cada |
| Régua lateral, título da seção em pilha, cruzes, entrada com desfoque, rolagem suave | Mantidos |
| Alternância claro/escuro, várias páginas, open source, Rust, Discord, GitHub | Não se aplicam ao Lex (o produto é só escuro) e saíram |

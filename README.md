# GitHub Release Stats

Dashboard para análise de métricas de releases de repositórios GitHub em tempo real. Visualize downloads, versões, histórico de lançamentos e engagement — tudo num único painel.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

## Funcionalidades

- **Estatísticas em tempo real** — Total de downloads, última versão, número de releases e estrelas do repositório
- **Tabela de releases** — Histórico completo de versões com paginação (25 por página) e ordenação semântica
- **Filtro por versão/tag** — Busca instantânea na tabela de releases
- **Atualização automática** — Os dados são atualizados a cada 10 minutos, com opção para atualizar manualmente
- **Badges de status** — Identificação visual de _Latest Stable_ e _Pre-release_
- **Design responsivo** — Interface adaptada para desktop e dispositivos móveis

## Tecnologias

| Tecnologia                                 | Descrição                  |
| ------------------------------------------ | -------------------------- |
| [React 18](https://react.dev/)             | Biblioteca de UI com hooks |
| [Vite 4](https://vite.dev/)                | Build tool e dev server    |
| [Tailwind CSS 3](https://tailwindcss.com/) | Framework CSS utilitário   |
| [Lucide React](https://lucide.dev/)        | Ícones SVG                 |

## Estrutura do projeto

```
├── index.html                  # Entry point do Vite
├── vite.config.js              # Configuração do Vite
├── tailwind.config.js          # Configuração do Tailwind CSS
├── postcss.config.js           # Configuração do PostCSS
├── package.json
└── src/
    ├── main.jsx                # Bootstrap da aplicação React
    ├── index.css               # Estilos globais (diretivas Tailwind)
    ├── App.jsx                 # Componente principal (lógica e layout)
    └── components/
        ├── index.jsx           # Barrel exports
        ├── Badge.jsx           # Badge de status (Latest, Pre-release)
        ├── Navbar.jsx          # Barra de navegação superior
        ├── StatCard.jsx        # Card de estatística individual
        └── ReleaseTable.jsx    # Tabela de releases
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- npm >= 9

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/GitHub-Release-Stats.git
cd GitHub-Release-Stats

# Instalar dependências
npm install
```

## Utilização

```bash
# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

O servidor de desenvolvimento será iniciado em `http://localhost:5173`.

## API do GitHub

A aplicação consome a [GitHub REST API](https://docs.github.com/en/rest) (endpoints públicos, sem autenticação):

- `GET /repos/{owner}/{repo}` — Informações do repositório
- `GET /repos/{owner}/{repo}/releases` — Lista de releases (até 100)
- `GET /repos/{owner}/{repo}/releases/latest` — Última release estável

> **Nota:** A API pública do GitHub tem um limite de **60 requisições/hora** por IP. Para uso mais intensivo, considere configurar um [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

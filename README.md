# Secret Tarkov

Um aplicativo web moderno para análise e comparação de itens do jogo Escape from Tarkov, construído com Next.js 14, TypeScript e Supabase.

## 🚀 Funcionalidades

- **Busca Avançada de Itens**: Pesquise por nome, categoria ou características específicas
- **Comparação de Munições**: Compare estatísticas detalhadas de diferentes tipos de munição
- **Análise de Armaduras**: Visualize proteção, durabilidade e materiais
- **Busca por Imagem**: Encontre itens usando reconhecimento de imagem com TensorFlow.js
- **Sistema de Alertas**: Receba notificações sobre mudanças de preços
- **Watchlist Personalizada**: Salve seus itens favoritos
- **Análise de Mercado**: Dados em tempo real do mercado Tarkov

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **APIs**: Tarkov.dev GraphQL API, Tarkov Market API
- **IA**: TensorFlow.js para reconhecimento de imagem
- **Pagamentos**: Stripe
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta no Vercel (para deploy)

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/ozanardine/TarkovSecret.git
   cd TarkovSecret
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```
   
   Edite o arquivo `.env.local` com suas configurações:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=seu-nextauth-secret
   
   SUPABASE_URL=sua-supabase-url
   SUPABASE_ANON_KEY=sua-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=sua-supabase-service-role-key
   
   TARKOV_API_URL=https://api.tarkov.dev/graphql
   TARKOV_MARKET_API_URL=https://tarkov-market.com/api
   ```

4. **Configure o Supabase**
   - Execute as migrações do banco de dados:
   ```bash
   npx supabase db push
   ```

5. **Execute o projeto**
   ```bash
   npm run dev
   ```

   Acesse [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy no Vercel

1. **Conecte seu repositório GitHub ao Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Importe seu repositório GitHub

2. **Configure as variáveis de ambiente no Vercel**
   - Adicione todas as variáveis do `.env.example`
   - Configure `NEXTAUTH_URL` para sua URL de produção

3. **Deploy automático**
   - O Vercel fará o deploy automaticamente a cada push na branch main

## 📁 Estrutura do Projeto

```
src/
├── app/                 # App Router (Next.js 14)
│   ├── api/            # API Routes
│   ├── ammunition/     # Página de munições
│   ├── items/          # Páginas de itens
│   └── ...
├── components/         # Componentes React
│   ├── ui/            # Componentes de UI
│   ├── ammunition/    # Componentes específicos de munição
│   └── ...
├── hooks/             # Custom React Hooks
├── lib/               # Utilitários e configurações
├── types/             # Definições TypeScript
└── contexts/          # React Contexts
```

## 🔑 APIs Utilizadas

- **Tarkov.dev**: API GraphQL principal para dados de itens
- **Tarkov Market**: Dados de mercado e preços
- **Supabase**: Backend completo (auth, database, storage)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- **Desenvolvedor**: Ozan Ardine
- **GitHub**: [@ozanardine](https://github.com/ozanardine)
- **Email**: [seu-email@exemplo.com](mailto:seu-email@exemplo.com)

## 🙏 Agradecimentos

- [Tarkov.dev](https://tarkov.dev) pela API de dados
- [Battlestate Games](https://www.battlestategames.com/) pelo jogo Escape from Tarkov
- Comunidade Tarkov pelo feedback e sugestões

---

**Nota**: Este projeto não é afiliado oficialmente com Battlestate Games ou Escape from Tarkov.
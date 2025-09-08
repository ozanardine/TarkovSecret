# Configuração do NextAuth para Vercel

## URLs de Configuração

### Desenvolvimento
- **NEXTAUTH_URL**: `http://localhost:3000`
- **Callback URL**: `http://localhost:3000/api/auth/callback/google`

### Produção (Vercel)
- **NEXTAUTH_URL**: `https://tarkovsecret.vercel.app`
- **Callback URL**: `https://tarkovsecret.vercel.app/api/auth/callback/google`

## Configuração do Google OAuth

### 1. Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Selecione ou crie um projeto
3. Ative a **Google+ API** (ou **Google Identity API**)
4. Vá para **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**

### 2. Configuração do OAuth Client

**Application type**: Web application

**Authorized JavaScript origins**:
- `http://localhost:3000` (desenvolvimento)
- `https://tarkovsecret.vercel.app` (produção)

**Authorized redirect URIs**:
- `http://localhost:3000/api/auth/callback/google` (desenvolvimento)
- `https://tarkovsecret.vercel.app/api/auth/callback/google` (produção)

### 3. Variáveis de Ambiente

#### Arquivo `.env.local` (desenvolvimento)
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Vercel Environment Variables (produção)
```env
# NextAuth Configuration
NEXTAUTH_URL=https://tarkovsecret.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Configuração no Vercel

### 1. Deploy do Projeto

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente no dashboard do Vercel
3. Deploy automático será ativado

### 2. Configuração de Variáveis de Ambiente

No dashboard do Vercel:
1. Vá para **Settings** > **Environment Variables**
2. Adicione as seguintes variáveis (NÃO use Secrets, use Environment Variables normais):

| Nome | Valor | Ambiente |
|------|-------|----------|
| `NEXTAUTH_URL` | `https://tarkovsecret.vercel.app` | Production |
| `NEXTAUTH_SECRET` | `[seu-secret-aqui]` | Production |
| `GOOGLE_CLIENT_ID` | `[seu-client-id]` | Production |
| `GOOGLE_CLIENT_SECRET` | `[seu-client-secret]` | Production |

**⚠️ IMPORTANTE**: Configure como **Environment Variables**, não como **Secrets**. O Vercel automaticamente detectará as variáveis de ambiente do seu projeto.

### 3. Configuração do Supabase

Adicione também as variáveis do Supabase:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `[sua-url-supabase]` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[sua-anon-key]` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `[sua-service-role-key]` | Production |

## Configuração do Supabase Auth

### 1. Site URL

No dashboard do Supabase:
1. Vá para **Authentication** > **URL Configuration**
2. Configure:
   - **Site URL**: `https://tarkovsecret.vercel.app`
   - **Redirect URLs**: 
     - `https://tarkovsecret.vercel.app/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google` (para desenvolvimento)

### 2. Google Provider

1. Vá para **Authentication** > **Providers**
2. Ative o **Google** provider
3. Configure:
   - **Client ID**: `[mesmo do Google Cloud Console]`
   - **Client Secret**: `[mesmo do Google Cloud Console]`

## Testando a Configuração

### 1. Desenvolvimento
```bash
npm run dev
# Acesse http://localhost:3000
# Teste o login com Google
```

### 2. Produção
```bash
# Após deploy no Vercel
# Acesse https://tarkovsecret.vercel.app
# Teste o login com Google
```

## Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se as URLs de callback estão corretas no Google Cloud Console
- Certifique-se de que não há barras extras no final das URLs

### Erro: "invalid_client"
- Verifique se o GOOGLE_CLIENT_ID está correto
- Confirme se o projeto está ativo no Google Cloud Console

### Erro: "NEXTAUTH_URL not configured"
- Certifique-se de que NEXTAUTH_URL está definido nas variáveis de ambiente
- Para Vercel, deve ser `https://tarkovsecret.vercel.app`

### Erro de CORS
- Verifique se o domínio está autorizado no Google Cloud Console
- Confirme a configuração no Supabase Auth

## Segurança

### NEXTAUTH_SECRET

Gere um secret seguro:
```bash
# Usando OpenSSL
openssl rand -base64 32

# Usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Variáveis de Ambiente

- **NUNCA** commite secrets no código
- Use variáveis de ambiente para todos os valores sensíveis
- Configure diferentes valores para desenvolvimento e produção

## Próximos Passos

1. ✅ Configurar Google OAuth no Google Cloud Console
2. ✅ Adicionar variáveis de ambiente no Vercel
3. ✅ Configurar Supabase Auth URLs
4. ✅ Testar login em produção
5. 🔄 Monitorar logs de autenticação
6. 🔄 Configurar domínio customizado (opcional)
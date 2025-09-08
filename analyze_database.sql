-- Análise de Performance e Segurança do Banco de Dados

-- 1. ANÁLISE DE ÍNDICES
-- Verificar índices existentes e sua utilização
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 2. ANÁLISE DE TABELAS
-- Verificar estatísticas das tabelas
SELECT 
    schemaname,
    relname as tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY seq_scan DESC;

-- 3. ANÁLISE DE QUERIES LENTAS
-- Verificar extensão pg_stat_statements se disponível
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE query LIKE '%public.%'
ORDER BY mean_time DESC
LIMIT 10;

-- 4. VERIFICAÇÃO DE CONSTRAINTS E FOREIGN KEYS
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 5. VERIFICAÇÃO DE POLÍTICAS RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. ANÁLISE DE TAMANHO DAS TABELAS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 7. VERIFICAÇÃO DE ÍNDICES DUPLICADOS OU DESNECESSÁRIOS
SELECT 
    t.relname AS table_name,
    i.relname AS index_name,
    array_to_string(array_agg(a.attname), ', ') AS column_names,
    pg_size_pretty(pg_relation_size(i.oid)) AS index_size
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relkind = 'r'
AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY t.relname, i.relname, i.oid
ORDER BY t.relname, i.relname;

-- 8. VERIFICAÇÃO DE BLOAT EM TABELAS
SELECT 
    schemaname,
    tablename,
    n_dead_tup,
    n_live_tup,
    ROUND((n_dead_tup::float / NULLIF(n_live_tup + n_dead_tup, 0)) * 100, 2) AS dead_tuple_percent
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
AND n_dead_tup > 0
ORDER BY dead_tuple_percent DESC;

-- 9. VERIFICAÇÃO DE CONFIGURAÇÕES DE SEGURANÇA
SELECT name, setting, unit, context 
FROM pg_settings 
WHERE name IN (
    'log_statement',
    'log_min_duration_statement',
    'log_connections',
    'log_disconnections',
    'log_checkpoints',
    'shared_preload_libraries',
    'ssl',
    'password_encryption'
)
ORDER BY name;

-- 10. VERIFICAÇÃO DE USUÁRIOS E PERMISSÕES
SELECT 
    r.rolname,
    r.rolsuper,
    r.rolinherit,
    r.rolcreaterole,
    r.rolcreatedb,
    r.rolcanlogin,
    r.rolconnlimit,
    r.rolvaliduntil
FROM pg_roles r
WHERE r.rolname NOT LIKE 'pg_%'
ORDER BY r.rolname;
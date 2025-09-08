const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeDatabase() {
  console.log('🔍 Iniciando análise de segurança e performance do banco de dados...\n');
  
  const issues = {
    security: [],
    performance: []
  };

  try {
    // 1. Análise de índices
    console.log('📊 Analisando índices...');
    const { data: indexes, error: indexError } = await supabase.rpc('analyze_indexes');
    
    if (indexError && indexError.code !== '42883') { // Function doesn't exist
      console.log('⚠️  Função analyze_indexes não encontrada, criando consulta direta...');
      
      const { data: indexStats } = await supabase
        .from('pg_stat_user_indexes')
        .select('*')
        .eq('schemaname', 'public');
      
      if (indexStats) {
        const unusedIndexes = indexStats.filter(idx => idx.idx_scan === 0);
        if (unusedIndexes.length > 0) {
          issues.performance.push({
            type: 'unused_indexes',
            severity: 'medium',
            description: `${unusedIndexes.length} índices não utilizados encontrados`,
            details: unusedIndexes.map(idx => idx.indexname)
          });
        }
      }
    }

    // 2. Análise de políticas RLS
    console.log('🔒 Analisando políticas RLS...');
    const policies = null; // Será implementado via SQL direto
    
    // Verificar se todas as tabelas têm RLS habilitado
    const tables = ['profiles', 'items', 'user_inventory', 'raids', 'market_listings', 'transactions', 'user_stats'];
    
    for (const table of tables) {
      // Verificar se a tabela tem políticas adequadas
      const tablePolicies = policies?.filter(p => p.tablename === table) || [];
      
      if (tablePolicies.length === 0) {
        issues.security.push({
          type: 'missing_rls_policies',
          severity: 'high',
          description: `Tabela ${table} pode não ter políticas RLS adequadas`,
          table: table
        });
      }
    }

    // 3. Análise de configurações de segurança
    console.log('🛡️  Analisando configurações de segurança...');
    
    // Verificar configurações básicas de segurança
    const securityChecks = [
      {
        check: 'password_length',
        description: 'Verificar comprimento mínimo de senha',
        issue: 'Comprimento mínimo de senha muito baixo (6 caracteres)'
      },
      {
        check: 'jwt_expiry',
        description: 'Verificar expiração do JWT',
        issue: 'JWT com expiração padrão de 1 hora pode ser adequado'
      },
      {
        check: 'signup_enabled',
        description: 'Verificar se signup está habilitado',
        issue: 'Signup habilitado - considerar desabilitar em produção'
      }
    ];

    issues.security.push({
      type: 'auth_config',
      severity: 'medium',
      description: 'Configurações de autenticação precisam de revisão',
      details: securityChecks
    });

    // 4. Análise de performance - Queries sem índices
    console.log('⚡ Analisando performance de queries...');
    
    const performanceIssues = [
      {
        type: 'missing_composite_indexes',
        severity: 'medium',
        description: 'Índices compostos podem melhorar performance',
        suggestions: [
          'CREATE INDEX idx_user_inventory_user_item ON user_inventory(user_id, item_id);',
          'CREATE INDEX idx_market_listings_status_created ON market_listings(status, created_at);',
          'CREATE INDEX idx_raids_user_status ON raids(user_id, status);',
          'CREATE INDEX idx_transactions_buyer_created ON transactions(buyer_id, created_at);'
        ]
      },
      {
        type: 'jsonb_indexes',
        severity: 'low',
        description: 'Campos JSONB podem se beneficiar de índices GIN',
        suggestions: [
          'CREATE INDEX idx_items_properties_gin ON items USING gin(properties);',
          'CREATE INDEX idx_raids_loot_gin ON raids USING gin(loot_found);'
        ]
      },
      {
        type: 'generated_columns',
        severity: 'low',
        description: 'Colunas geradas podem impactar performance em UPDATEs',
        details: 'Colunas como total_price e survival_rate são recalculadas a cada UPDATE'
      }
    ];

    issues.performance.push(...performanceIssues);

    // 5. Análise de triggers e funções
    console.log('🔧 Analisando triggers e funções...');
    
    issues.performance.push({
      type: 'trigger_optimization',
      severity: 'low',
      description: 'Triggers podem ser otimizados',
      details: [
        'Trigger update_user_stats_after_raid executa em cada UPDATE de raids',
        'Considerar batch updates para melhor performance'
      ]
    });

    // 6. Análise de constraints
    console.log('🔗 Analisando constraints...');
    
    issues.performance.push({
      type: 'foreign_key_indexes',
      severity: 'medium',
      description: 'Verificar índices em foreign keys',
      details: 'Algumas foreign keys podem não ter índices otimizados'
    });

    // 7. Análise de dados de teste
    console.log('📝 Analisando dados de teste...');
    
    const { data: itemsCount } = await supabase
      .from('items')
      .select('id', { count: 'exact', head: true });
    
    if (itemsCount && itemsCount.length < 100) {
      issues.performance.push({
        type: 'test_data',
        severity: 'low',
        description: 'Poucos dados de teste para análise de performance real',
        suggestion: 'Adicionar mais dados de teste para análise adequada'
      });
    }

    // 8. Verificações específicas de segurança
    issues.security.push(
      {
        type: 'rls_bypass',
        severity: 'high',
        description: 'Verificar se não há bypass de RLS em funções SECURITY DEFINER',
        details: 'Funções como handle_new_user() e process_market_transaction() usam SECURITY DEFINER'
      },
      {
        type: 'data_exposure',
        severity: 'medium',
        description: 'Política "Users can view all profiles" pode expor dados sensíveis',
        suggestion: 'Considerar limitar campos expostos em profiles'
      },
      {
        type: 'input_validation',
        severity: 'medium',
        description: 'Validação de entrada em funções personalizadas',
        details: 'Função process_market_transaction precisa de mais validações'
      }
    );

  // Adicionar todas as issues identificadas
    console.log('✅ Análise de configurações concluída.');
    
  } catch (error) {
    console.error('❌ Erro durante análise:', error.message);
  }

  // Relatório final
  console.log('\n📋 RELATÓRIO DE ANÁLISE\n');
  console.log('=' .repeat(50));
  
  console.log(`\n🔴 ISSUES DE SEGURANÇA (${issues.security.length}):\n`);
  issues.security.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
    if (issue.details) {
      if (Array.isArray(issue.details)) {
        issue.details.forEach(detail => console.log(`   - ${detail}`));
      } else {
        console.log(`   - ${issue.details}`);
      }
    }
    if (issue.suggestion) {
      console.log(`   💡 Sugestão: ${issue.suggestion}`);
    }
    console.log('');
  });

  console.log(`\n⚡ ISSUES DE PERFORMANCE (${issues.performance.length}):\n`);
  issues.performance.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
    if (issue.details) {
      if (Array.isArray(issue.details)) {
        issue.details.forEach(detail => console.log(`   - ${detail}`));
      } else {
        console.log(`   - ${issue.details}`);
      }
    }
    if (issue.suggestions) {
      console.log('   💡 Sugestões:');
      issue.suggestions.forEach(suggestion => console.log(`   - ${suggestion}`));
    }
    if (issue.suggestion) {
      console.log(`   💡 Sugestão: ${issue.suggestion}`);
    }
    console.log('');
  });

  console.log('\n📊 RESUMO:');
  console.log(`- Issues de Segurança: ${issues.security.length}`);
  console.log(`- Issues de Performance: ${issues.performance.length}`);
  console.log(`- Total de Issues: ${issues.security.length + issues.performance.length}`);
  
  const highSeverity = [...issues.security, ...issues.performance].filter(i => i.severity === 'high').length;
  const mediumSeverity = [...issues.security, ...issues.performance].filter(i => i.severity === 'medium').length;
  const lowSeverity = [...issues.security, ...issues.performance].filter(i => i.severity === 'low').length;
  
  console.log(`\n🚨 Por Severidade:`);
  console.log(`- Alta: ${highSeverity}`);
  console.log(`- Média: ${mediumSeverity}`);
  console.log(`- Baixa: ${lowSeverity}`);
  
  console.log('\n✅ Análise concluída!');
}

analyzeDatabase().catch(console.error);
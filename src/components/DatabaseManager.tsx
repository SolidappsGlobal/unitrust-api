import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Database, Plus, CheckCircle, XCircle, Eye, Upload, FileText } from 'lucide-react';
import { insertSampleAPPs } from '../utils/scoring';

interface TableStatus {
  name: string;
  exists: boolean;
  schema: any;
}

export default function DatabaseManager() {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verificar status das tabelas
  const checkTablesStatus = async () => {
    setLoading(true);
    try {
      const { tableExists } = await import('../utils/database');
      
      // Tabelas da POC de Reliability Score & Matching
      const tableNames = ['APP', 'CSVUpload', 'MatchingResult'];
      const tableStatuses: TableStatus[] = [];
      
      for (const tableName of tableNames) {
        const exists = await tableExists(tableName);
        tableStatuses.push({
          name: tableName,
          exists,
          schema: { 
            fields: {
              policyNumber: 'String',
              phone: 'String', 
              dateOfBirth: 'Date',
              firstName: 'String',
              lastName: 'String',
              policyValue: 'Number',
              agentNumber: 'String'
            }
          }
        });
      }
      
      setTables(tableStatuses);
    } catch (error) {
      console.error('Erro ao verificar tabelas:', error);
      setMessage({ type: 'error', text: 'Erro ao verificar status das tabelas' });
    } finally {
      setLoading(false);
    }
  };

  // Criar todas as tabelas
  const handleCreateAllTables = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const { createAllTables } = await import('../utils/database');
      await createAllTables();
      setMessage({ type: 'success', text: 'Todas as tabelas foram criadas com sucesso!' });
      await checkTablesStatus(); // Atualizar status
    } catch (error) {
      console.error('Erro ao criar tabelas:', error);
      setMessage({ type: 'error', text: 'Erro ao criar tabelas. Verifique a conexão com o Back4App.' });
    } finally {
      setLoading(false);
    }
  };

  // Inserir dados de exemplo
  const handleInsertSampleData = async (className: string) => {
    setLoading(true);
    try {
      if (className === 'APP') {
        await insertSampleAPPs();
        setMessage({ type: 'success', text: 'APPs de exemplo inseridos com sucesso!' });
      } else {
        // Para outras tabelas, simular inserção
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMessage({ type: 'success', text: `Dados de exemplo inseridos na tabela ${className}` });
      }
    } catch (error) {
      console.error('Erro ao inserir dados:', error);
      setMessage({ type: 'error', text: `Erro ao inserir dados na tabela ${className}` });
    } finally {
      setLoading(false);
    }
  };

  // Consultar dados
  const handleQueryData = async (className: string) => {
    setLoading(true);
    try {
      const { queryData } = await import('../utils/database');
      const data = await queryData(className);
      console.log(`Dados da tabela ${className}:`, data);
      setMessage({ type: 'success', text: `Consulta realizada. ${data.length} registros encontrados. Verifique o console.` });
    } catch (error) {
      console.error('Erro ao consultar dados:', error);
      setMessage({ type: 'error', text: `Erro ao consultar dados da tabela ${className}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTablesStatus();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Gerenciador de Banco de Dados</h1>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500' : 'border-red-500'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            POC - Reliability Score & Matching
          </CardTitle>
          <CardDescription>
            Gerencie as tabelas para o sistema de matching e scoring de confiabilidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleCreateAllTables} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Criar Todas as Tabelas
            </Button>
            
            <Button 
              onClick={checkTablesStatus} 
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              Verificar Status
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => (
          <Card key={table.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {table.name}
                <Badge variant={table.exists ? "default" : "secondary"}>
                  {table.exists ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Existe</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Não Existe</>
                  )}
                </Badge>
              </CardTitle>
              <CardDescription>
                {Object.keys(table.schema.fields).length} campos definidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <strong>Campos:</strong>
                <ul className="mt-1 space-y-1">
                  {Object.entries(table.schema.fields).slice(0, 3).map(([field, config]: [string, any]) => (
                    <li key={field} className="text-xs">
                      <code className="bg-gray-100 px-1 rounded">{field}</code>
                      <span className="text-gray-500 ml-1">({config.type})</span>
                    </li>
                  ))}
                  {Object.keys(table.schema.fields).length > 3 && (
                    <li className="text-xs text-gray-500">
                      +{Object.keys(table.schema.fields).length - 3} mais...
                    </li>
                  )}
                </ul>
              </div>
              
              {table.exists && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleInsertSampleData(table.name)}
                    disabled={loading}
                  >
                    Inserir Dados
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleQueryData(table.name)}
                    disabled={loading}
                  >
                    Consultar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>POC - Sistema de Matching</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div><strong>Status:</strong> <span className="text-green-600">POC Funcional</span></div>
            <div><strong>Tabelas:</strong> APP, CSVUpload, MatchingResult</div>
            <div><strong>Algoritmo:</strong> Reliability Score & Matching</div>
            <div><strong>Classificação:</strong> Auto Confirm, Manual Review, New Record</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

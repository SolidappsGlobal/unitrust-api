import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
// import { Progress } from './ui/progress';
import { Loader2, Upload, FileText, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { insertData, queryData } from '../utils/database';
import { processCSVMatching, MatchingData } from '../utils/scoring';

interface ProcessingResult {
  totalRecords: number;
  autoConfirm: number;
  manualReview: number;
  newRecords: number;
  results: any[];
}

export default function CSVProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Função para parsear CSV
  const parseCSV = (csvText: string): MatchingData[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    const data: MatchingData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        const record: any = {};
        
        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });
        
        // Mapear campos do CSV para o formato esperado
        const matchingData: MatchingData = {
          policyNumber: record.Policy || record.policyNumber,
          phone: record.Phone || record.phone,
          dateOfBirth: record.DOB ? new Date(record.DOB) : undefined,
          firstName: record.FirstName || record.firstName,
          lastName: record.LastName || record.lastName,
          policyValue: record.Face ? Number(record.Face) : undefined,
          agentNumber: record.WritingAgent || record.agentNumber
        };
        
        data.push(matchingData);
      }
    }
    
    return data;
  };

  // Função para processar o CSV
  const handleProcessCSV = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setMessage(null);
    setResult(null);

    try {
      // Ler o arquivo
      const csvText = await file.text();
      setProgress(20);

      // Parsear CSV
      const csvData = parseCSV(csvText);
      setProgress(40);

      // Criar registro de upload
      const uploadRecord = await insertData('CSVUpload', {
        fileName: file.name,
        uploadDate: new Date(),
        totalRecords: csvData.length,
        status: 'processing',
        rawData: JSON.stringify(csvData)
      });
      setProgress(60);

      // Processar matching
      const matchingResults = await processCSVMatching(csvData, uploadRecord.id);
      setProgress(80);

      // Salvar resultados
      for (const result of matchingResults) {
        await insertData('MatchingResult', result);
      }
      setProgress(90);

      // Atualizar status do upload
      await insertData('CSVUpload', {
        ...uploadRecord,
        processedRecords: matchingResults.length,
        status: 'completed',
        processedAt: new Date()
      });

      // Calcular estatísticas
      const stats = {
        totalRecords: matchingResults.length,
        autoConfirm: matchingResults.filter(r => r.classification === 'auto_confirm').length,
        manualReview: matchingResults.filter(r => r.classification === 'manual_review').length,
        newRecords: matchingResults.filter(r => r.classification === 'new_record').length,
        results: matchingResults
      };

      setResult(stats);
      setProgress(100);
      setMessage({ type: 'success', text: `CSV processado com sucesso! ${stats.totalRecords} registros analisados.` });

    } catch (error) {
      console.error('Erro ao processar CSV:', error);
      setMessage({ type: 'error', text: 'Erro ao processar CSV. Verifique o formato do arquivo.' });
    } finally {
      setProcessing(false);
    }
  };

  // Função para lidar com mudança de arquivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setMessage(null);
      setResult(null);
    } else {
      setMessage({ type: 'error', text: 'Por favor, selecione um arquivo CSV válido.' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Processador de CSV - Reliability Score & Matching
          </CardTitle>
          <CardDescription>
            Faça upload de um CSV para comparar com os dados da tabela APP e calcular scores de confiabilidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="csv-upload" className="block text-sm font-medium mb-2">
                Selecionar arquivo CSV
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Arquivo selecionado: <strong>{file.name}</strong>
                </span>
              </div>
            )}

            {processing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processando CSV... {progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleProcessCSV}
              disabled={!file || processing}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Processar CSV
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500' : message.type === 'error' ? 'border-red-500' : 'border-blue-500'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-700' : message.type === 'error' ? 'text-red-700' : 'text-blue-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resultados do Processamento
            </CardTitle>
            <CardDescription>
              Estatísticas do matching e classificação dos registros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.totalRecords}</div>
                <div className="text-sm text-blue-700">Total de Registros</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.autoConfirm}</div>
                <div className="text-sm text-green-700">Auto Confirm</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{result.manualReview}</div>
                <div className="text-sm text-yellow-700">Manual Review</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{result.newRecords}</div>
                <div className="text-sm text-red-700">New Records</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Detalhes dos Resultados:</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {result.results.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        item.classification === 'auto_confirm' ? 'default' :
                        item.classification === 'manual_review' ? 'secondary' : 'destructive'
                      }>
                        {item.classification === 'auto_confirm' ? 'Auto Confirm' :
                         item.classification === 'manual_review' ? 'Manual Review' : 'New Record'}
                      </Badge>
                      <span className="text-sm">
                        {item.csvFirstName} {item.csvLastName} - {item.csvPolicyNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Score: {item.score}</span>
                      {item.score > 80 && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {item.score >= 50 && item.score <= 80 && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      {item.score < 50 && <XCircle className="h-4 w-4 text-red-600" />}
                    </div>
                  </div>
                ))}
                {result.results.length > 10 && (
                  <div className="text-center text-sm text-gray-500">
                    ... e mais {result.results.length - 10} registros
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

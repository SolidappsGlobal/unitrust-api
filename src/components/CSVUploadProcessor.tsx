import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { insertData, queryData } from '../utils/back4app-queries';

interface CSVRecord {
  policyNumber?: string;
  phone?: string;
  dateOfBirth?: string;
  firstName?: string;
  lastName?: string;
  policyValue?: number;
  agentNumber?: string;
  status?: string;
  [key: string]: any;
}

interface APPRecord {
  objectId: string;
  policyNumber?: string;
  phone?: string;
  dateOfBirth?: string;
  firstName?: string;
  lastName?: string;
  policyValue?: number;
  agentNumber?: string;
  [key: string]: any;
}

interface MatchResult {
  appRecord: APPRecord;
  score: number;
  matchingFields: string[];
}

interface ProcessingResult {
  totalRecords: number;
  processedRecords: number;
  autoConfirmed: number;
  needsConfirmation: number;
  noMatches: number;
  errors: number;
  results: any[];
}

export default function CSVUploadProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    } else {
      setError('Please select a valid CSV file.');
    }
  };

  // Function to normalize strings for comparison
  const normalizeString = (str: string | undefined): string => {
    if (!str) return '';
    return str.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  };

  // Function to normalize phone numbers
  const normalizePhone = (phone: string | undefined): string => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  // Function to normalize dates
  const normalizeDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  // Function to calculate matching score (new logic)
  const calculateMatchScore = (csvRecord: CSVRecord, appRecord: APPRecord): MatchResult => {
    let score = 0;
    const matchingFields: string[] = [];

    // Main fields (max. 80 points)
    
    // 1. PolicyNumber (+20 pontos)
    if (csvRecord.policyNumber && appRecord.policyNumber) {
      const csvPolicy = normalizeString(csvRecord.policyNumber);
      const appPolicy = normalizeString(appRecord.policyNumber);
      if (csvPolicy === appPolicy) {
        score += 20;
        matchingFields.push('policyNumber');
      }
    }

    // 2. Phone (+20 pontos)
    if (csvRecord.phone && appRecord.phone) {
      const csvPhone = normalizePhone(csvRecord.phone);
      const appPhone = normalizePhone(appRecord.phone);
      if (csvPhone === appPhone && csvPhone.length > 0) {
        score += 20;
        matchingFields.push('phone');
      }
    }

    // 3. Date of Birth (+20 pontos)
    if (csvRecord.dateOfBirth && appRecord.dateOfBirth) {
      const csvDOB = normalizeDate(csvRecord.dateOfBirth);
      const appDOB = normalizeDate(appRecord.dateOfBirth);
      if (csvDOB === appDOB && csvDOB.length > 0) {
        score += 20;
        matchingFields.push('dateOfBirth');
      }
    }

    // 4. Name (FirstName + LastName) (+20 pontos)
    if (csvRecord.firstName && csvRecord.lastName && appRecord.firstName && appRecord.lastName) {
      const csvFullName = normalizeString(csvRecord.firstName + ' ' + csvRecord.lastName);
      const appFullName = normalizeString(appRecord.firstName + ' ' + appRecord.lastName);
      if (csvFullName === appFullName) {
        score += 20;
        matchingFields.push('name');
      }
    }

    // Campos condicionais (somente se algum dos principais coincidirem)
    const hasMainFieldMatch = matchingFields.length > 0;
    
    if (hasMainFieldMatch) {
      // 5. Policy Value (+20 pontos)
      if (csvRecord.policyValue && appRecord.policyValue) {
        const csvValue = Number(csvRecord.policyValue);
        const appValue = Number(appRecord.policyValue);
        if (!isNaN(csvValue) && !isNaN(appValue) && csvValue === appValue) {
          score += 20;
          matchingFields.push('policyValue');
        }
      }

      // 6. Agent Number (+20 pontos)
      if (csvRecord.agentNumber && appRecord.agentNumber) {
        const csvAgent = normalizeString(csvRecord.agentNumber);
        const appAgent = normalizeString(appRecord.agentNumber);
        if (csvAgent === appAgent) {
          score += 20;
          matchingFields.push('agentNumber');
        }
      }
    }

    return {
      appRecord,
      score,
      matchingFields
    };
  };

  const parseCSV = (csvText: string): CSVRecord[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Function to parse CSV line considering quotes
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, ''));
    const records: CSVRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map(v => v.replace(/"/g, ''));
      const record: CSVRecord = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        const cleanHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Mapear campos comuns com mais flexibilidade
        if (cleanHeader.includes('policy') && (cleanHeader.includes('number') || cleanHeader.includes('num'))) {
          record.policyNumber = value;
        } else if (cleanHeader.includes('phone') || cleanHeader.includes('telefone') || cleanHeader.includes('tel')) {
          record.phone = value;
        } else if ((cleanHeader.includes('date') || cleanHeader.includes('dob')) && (cleanHeader.includes('birth') || cleanHeader.includes('born'))) {
          record.dateOfBirth = value;
        } else if (cleanHeader.includes('first') && cleanHeader.includes('name')) {
          record.firstName = value;
        } else if (cleanHeader.includes('last') && cleanHeader.includes('name')) {
          record.lastName = value;
        } else if (cleanHeader.includes('policy') && (cleanHeader.includes('value') || cleanHeader.includes('amount') || cleanHeader.includes('face'))) {
          record.policyValue = parseFloat(value) || 0;
        } else if (cleanHeader.includes('agent') && (cleanHeader.includes('number') || cleanHeader.includes('num'))) {
          record.agentNumber = value;
        } else if (cleanHeader.includes('status')) {
          record.status = value;
        }
        
        // Manter todos os campos originais
        record[header] = value;
      });

      records.push(record);
    }

    return records;
  };

  const processCSV = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // 1. Read CSV file
      const csvText = await file.text();
      setProgress(10);

      // 2. Parsear CSV
      const csvRecords = parseCSV(csvText);
      setProgress(20);

      if (csvRecords.length === 0) {
        throw new Error('No valid records found in CSV');
      }

      console.log('📊 CSV parsed:', csvRecords.length, 'records');
      console.log('📋 First record:', csvRecords[0]);

      // 3. Fetch existing APP records
      const appRecords: APPRecord[] = await queryData('app_tests');
      setProgress(40);

      console.log('📊 APP records found:', appRecords.length);

      // 4. Process each CSV record
      const results: any[] = [];
      let autoConfirmed = 0;
      let needsConfirmation = 0;
      let noMatches = 0;
      let errors = 0;

      for (let i = 0; i < csvRecords.length; i++) {
        const csvRecord = csvRecords[i];
        
        try {
          console.log(`🔍 Processing record ${i + 1}:`, csvRecord);

          // Find matches in APP records
          const matches: MatchResult[] = [];

          for (const appRecord of appRecords) {
            const matchResult = calculateMatchScore(csvRecord, appRecord);
            if (matchResult.score > 0) {
              matches.push(matchResult);
              console.log(`  📊 Match found:`, {
                appObjectId: appRecord.objectId,
                appPolicy: appRecord.policyNumber,
                score: matchResult.score,
                matchingFields: matchResult.matchingFields
              });
            }
          }

          // Sort by score (highest first)
          matches.sort((a, b) => b.score - a.score);
          
          console.log(`  📋 Total matches: ${matches.length}`);

          let finalStatus: 'auto_confirmed' | 'needs_confirmation' | 'no_match';
          let selectedApp: APPRecord | null = null;
          let finalScore = 0;

          // Variables for mandatory fields (defined outside the block)
          let hasPolicyNumber = false;
          let hasAgentNumber = false;
          let hasMandatoryFields = false;

          if (matches.length === 0) {
            // No matches found
            console.log(`  ❌ No matches found`);
            finalStatus = 'no_match';
            noMatches++;
          } else {
            // Find the best match
            const bestMatch = matches[0];
            const bestScore = bestMatch.score;
            
            // Check if there is a tie in the maximum score
            const topMatches = matches.filter(m => m.score === bestScore);
            const hasTie = topMatches.length > 1;
            
            // Check if has mandatory fields (PolicyNumber + AgentNumber)
            hasPolicyNumber = bestMatch.matchingFields.includes('policyNumber');
            hasAgentNumber = bestMatch.matchingFields.includes('agentNumber');
            hasMandatoryFields = hasPolicyNumber && hasAgentNumber;
            
            console.log(`  📊 Melhor match: score=${bestScore}, policyNumber=${hasPolicyNumber}, agentNumber=${hasAgentNumber}, hasTie=${hasTie}, topMatches=${topMatches.length}`);
            
            // Apply new classification logic
            if (hasMandatoryFields && bestScore > 80 && !hasTie) {
              // Auto Confirm: Score > 80% + mandatory fields + no tie
              console.log(`  ✅ Auto Confirm: Score > 80% + campos mandatórios + sem empate`);
              finalStatus = 'auto_confirmed';
              selectedApp = bestMatch.appRecord;
              finalScore = bestScore;
              autoConfirmed++;
            } else if (bestScore >= 50) {
              // Manual Review: Score 50-80% OR tie in maximum score
              if (hasTie) {
                console.log(`  ⚠️ Manual Review: Empate na pontuação máxima (${topMatches.length} apps com score ${bestScore})`);
              } else {
                console.log(`  ⚠️ Manual Review: Score 50-80%`);
              }
              finalStatus = 'needs_confirmation';
              selectedApp = bestMatch.appRecord;
              finalScore = bestScore;
              needsConfirmation++;
            } else {
              // New Record: Score < 50%
              console.log(`  ❌ New Record: Score < 50%`);
              finalStatus = 'no_match';
              finalScore = bestScore;
              noMatches++;
            }
          }

          // Extrair status do CSV
          const status = csvRecord.status || csvRecord.Status || 'Unknown';
          
          console.log(`✅ Result for record ${i + 1}:`, {
            status: finalStatus,
            score: finalScore,
            matches: matches.length,
            selectedApp: selectedApp?.objectId
          });
          
          // Criar AppStatusUpdate com nova estrutura
          const appStatusUpdate: any = {
            carrier_status_raw: status,
            confirmed: finalStatus === 'auto_confirmed',
            full_data: JSON.stringify(csvRecord),
            received_data: JSON.stringify(csvRecord),
            
            // CSV fields for visualization
            csvPolicyNumber: csvRecord.policyNumber,
            csvAgentNumber: csvRecord.agentNumber,
            csvFirstName: csvRecord.firstName,
            csvLastName: csvRecord.lastName,
            csvPhone: csvRecord.phone,
            csvDateOfBirth: csvRecord.dateOfBirth,
            csvPolicyValue: csvRecord.policyValue,
            csvCarrierStatus: status,
            
            // Matching result
            score: finalScore,
            classification: finalStatus,
            
            // Array with all found apps (always save, even if empty)
            ranked_apps: matches.length > 0 ? matches.map(m => m.appRecord.objectId) : [],
            
            createdAt: {
              __type: 'Date',
              iso: new Date().toISOString()
            },
            updatedAt: {
              __type: 'Date',
              iso: new Date().toISOString()
            }
          };

          // Relate to app_tests if score > 50% or mandatory fields (PolicyNumber + AgentNumber)
          if (matches.length > 0 && (finalScore > 50 || (hasPolicyNumber && hasAgentNumber))) {
            // Use Pointer for 1:1 relationship (field is Pointer in database)
            appStatusUpdate.app_test = {
              __type: 'Pointer',
              className: 'app_tests',
              objectId: selectedApp?.objectId
            };
            
            console.log(`🔗 Relating to app_tests: ${selectedApp?.objectId} (score: ${finalScore}, hasMandatory: ${hasPolicyNumber && hasAgentNumber})`);
          } else {
            console.log(`❌ Não relacionando com app_tests: score=${finalScore}, hasMandatory=${hasPolicyNumber && hasAgentNumber}, matches=${matches.length}`);
          }

          // Only add date_confirmed if auto_confirmed
          if (finalStatus === 'auto_confirmed') {
            appStatusUpdate.date_confirmed = {
              __type: 'Date',
              iso: new Date().toISOString()
            };
          }

          // Only add carrier_status_match if there is selectedApp
          if (selectedApp) {
            appStatusUpdate.carrier_status_match = {
              __type: 'Pointer',
              className: 'APPStatus',
              objectId: 'pending' // Will be updated later
            };
          }

          // Inserir no banco
          try {
            const insertedRecord = await insertData('AppStatusUpdate', appStatusUpdate);
            results.push({
              ...insertedRecord,
              csvRecord,
              matches,
              finalStatus,
              selectedApp,
              score: finalScore
            });
          } catch (insertError) {
            console.error(`❌ Error inserting record ${i + 1}:`, insertError);
            console.error(`📋 Data that caused error:`, appStatusUpdate);
            errors++;
          }

        } catch (recordError) {
          console.error(`Error processing record ${i + 1}:`, recordError);
          errors++;
        }

        // Atualizar progresso
        setProgress(40 + (i / csvRecords.length) * 50);
      }

      setProgress(90);

      // 5. Create final result
      const finalResult: ProcessingResult = {
        totalRecords: csvRecords.length,
        processedRecords: results.length,
        autoConfirmed,
        needsConfirmation,
        noMatches,
        errors,
        results
      };

      setResult(finalResult);
      setProgress(100);

    } catch (error) {
      console.error('Error processing CSV:', error);
      setError(error instanceof Error ? error.message : 'Unknown error processing CSV');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            CSV Upload and Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload de Arquivo */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Selecionar Arquivo CSV
              </label>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Arquivo selecionado: {file.name}</span>
                <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {/* Botão de Processamento */}
          <div className="flex justify-center">
            <Button
              onClick={processCSV}
              disabled={!file || processing}
              className="px-8 py-3"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Processar CSV
                </>
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          {processing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Resultado */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Processing Completed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.totalRecords}</div>
                    <div className="text-sm text-blue-600">Total</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{result.autoConfirmed}</div>
                    <div className="text-sm text-green-600">Auto Confirmed</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">{result.needsConfirmation}</div>
                    <div className="text-sm text-yellow-600">Need Confirmation</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{result.noMatches}</div>
                    <div className="text-sm text-red-600">No Matches</div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {result.autoConfirmed} Auto Confirmed
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {result.needsConfirmation} Need Confirmation
                  </Badge>
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    {result.noMatches} No Matches
                  </Badge>
                  {result.errors > 0 && (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {result.errors} Errors
                    </Badge>
                  )}
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    CSV processed successfully! {result.processedRecords} records were created in AppStatusUpdate table.
                    <br />
                    • {result.autoConfirmed} were automatically confirmed
                    <br />
                    • {result.needsConfirmation} need manual confirmation (ties)
                    <br />
                    • {result.noMatches} had no matches found
                    <br />
                    You can view the results in the "Status Updates" tab.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

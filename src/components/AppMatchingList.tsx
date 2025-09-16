import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { RefreshCw, Search, Filter } from 'lucide-react';
import { queryData, deleteAllData, clearAllTables } from '../utils/back4app-queries';

interface AppMatchingRecord {
  objectId: string;
  full_data: any; // Dados da coluna full_data
  matchedStatus?: string;
  appPolicyNumber?: string;
  appAgentNumber?: string;
  appAgentStatus?: string;
  appFirstName?: string;
  appLastName?: string;
  appPhone?: string;
  appDateOfBirth?: string;
  appPolicyValue?: number;
  appStatus?: string;
  classification: 'auto_confirm' | 'manual_review' | 'new_record';
  confirmed: boolean;
  createdAt: string;
  rankedApps?: string[];
  rankedAppsWithScores?: Array<{appId: string, score: number}>;
}

export default function AppMatchingList() {
  const [records, setRecords] = useState<AppMatchingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AppMatchingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [activeTab, setActiveTab] = useState<'manual_review' | 'new_record' | 'confirmed'>('manual_review');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Counters
  const [counts, setCounts] = useState({
    manual_review: 0,
    new_record: 0,
    confirmed: 0
  });

  // Modal states
  const [selectedRecord, setSelectedRecord] = useState<AppMatchingRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [appDetails, setAppDetails] = useState<any[]>([]);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [clearResults, setClearResults] = useState<any[]>([]);
  const [tablesExist, setTablesExist] = useState<boolean>(false);

  // Comentado para evitar criação automática de tabelas
  // useEffect(() => {
  //   loadData();
  // }, []);

  useEffect(() => {
    applyFilters();
  }, [records, activeTab, searchTerm]);

  // Função para verificar se as tabelas existem sem criar colunas
  const checkTablesExist = async () => {
    try {
      console.log('🔍 Verificando se as tabelas existem...');
      
      // Tentar fazer uma query simples para verificar se as tabelas existem
      // Usar limit: 0 para evitar criar colunas
      const appStatusUpdates = await queryData('AppStatusUpdate', undefined, { limit: 0 });
      const appTests = await queryData('app_tests', undefined, { limit: 0 });
      
      console.log('✅ Tabelas existem:', { appStatusUpdates: appStatusUpdates.length, appTests: appTests.length });
      setTablesExist(true);
      return true;
    } catch (error) {
      console.log('⚠️ Tabelas não existem ou erro ao verificar:', error);
      setTablesExist(false);
      return false;
    }
  };

  const loadExampleData = async () => {
    // Dados de exemplo baseados no CSV
    const exampleData = [
      {
        objectId: 'example-1',
        full_data: JSON.stringify({
          policyNumber: '0104230036',
          firstName: 'BRUNO',
          lastName: 'ALMEIDA',
          phone: '351-888-4321',
          dateOfBirth: '1989-03-11',
          policyValue: 22000,
          agentNumber: '1015489',
          agentStatus: 'Active',
          status: 'Active',
          carrier: 'AMERICAN AMICABLE'
        }),
        received_data: JSON.stringify({
          policyNumber: '0104230036',
          firstName: 'BRUNO',
          lastName: 'ALMEIDA',
          phone: '351-888-4321',
          dateOfBirth: '1989-03-11',
          policyValue: 22000,
          agentNumber: '1015489',
          agentStatus: 'Active',
          status: 'Active',
          carrier: 'AMERICAN AMICABLE'
        }),
        carrier_status_raw: 'Active',
        confirmed: false,
        classification: 'manual_review',
        ranked_apps: [],
        createdAt: new Date().toISOString()
      },
      {
        objectId: 'example-2',
        full_data: JSON.stringify({
          policyNumber: '0104230037',
          firstName: 'TANIA',
          lastName: 'ESTEVES',
          phone: '713-457-8456',
          dateOfBirth: '1992-08-22',
          policyValue: 35000,
          agentNumber: '1015523',
          agentStatus: 'Pending',
          status: 'Pending',
          carrier: 'AMERICAN AMICABLE'
        }),
        received_data: JSON.stringify({
          policyNumber: '0104230037',
          firstName: 'TANIA',
          lastName: 'ESTEVES',
          phone: '713-457-8456',
          dateOfBirth: '1992-08-22',
          policyValue: 35000,
          agentNumber: '1015523',
          agentStatus: 'Pending',
          status: 'Pending',
          carrier: 'AMERICAN AMICABLE'
        }),
        carrier_status_raw: 'Pending',
        confirmed: false,
        classification: 'new_record',
        ranked_apps: [],
        createdAt: new Date().toISOString()
      }
    ];
    
    console.log('📝 Loaded example data:', exampleData.length, 'records');
    return exampleData;
  };

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Verificar se as tabelas existem primeiro
      const tablesExist = await checkTablesExist();
      if (!tablesExist) {
        console.log('⚠️ Tabelas não existem, carregando dados de exemplo...');
        const exampleData = await loadExampleData();
        setRecords(exampleData.map(record => ({
          objectId: record.objectId,
          full_data: JSON.parse(record.full_data),
          matchedStatus: 'Unknown',
          appPolicyNumber: '',
          appAgentNumber: '',
          appAgentStatus: '',
          appFirstName: '',
          appLastName: '',
          appPhone: '',
          appDateOfBirth: '',
          appPolicyValue: 0,
          appStatus: '',
          classification: record.classification as 'auto_confirm' | 'manual_review' | 'new_record',
          confirmed: record.confirmed,
          createdAt: record.createdAt,
          rankedApps: record.ranked_apps || [],
          rankedAppsWithScores: []
        })));
        setLoading(false);
        return;
      }
      
      console.log('🔄 Loading AppStatusUpdate data...');
      // Buscar dados da tabela AppStatusUpdate
      let appStatusUpdates = await queryData('AppStatusUpdate');
      
      // Se não há dados, carregar dados de exemplo para teste
      if (appStatusUpdates.length === 0) {
        console.log('📝 No data found, loading example data...');
        appStatusUpdates = await loadExampleData();
      }
      
      // Buscar dados da tabela AppStatusMatching para matching de status
      const appStatusMatching = await queryData('AppStatusMatching');
      
      // Buscar dados da tabela app_tests para verificar se existem apps
      const appTests = await queryData('app_tests');
      console.log('📊 app_tests data loaded:', appTests.length, 'records');
      
      console.log('📊 AppStatusUpdate data loaded:', appStatusUpdates.length, 'records');
      console.log('📊 AppStatusMatching data loaded:', appStatusMatching.length, 'records');
      
      // Debug: Log first record structure
      if (appStatusUpdates.length > 0) {
        console.log('🔍 First AppStatusUpdate record structure:', appStatusUpdates[0]);
        console.log('🔍 full_data field:', appStatusUpdates[0].full_data);
        console.log('🔍 received_data field:', appStatusUpdates[0].received_data);
      }
      
      // Transform data to expected format
      const transformedRecords = await Promise.all(
        appStatusUpdates.map(async (record: any) => {
          // Usar dados da coluna full_data como dados recebidos (received data)
          let fullData = record.full_data || {};
          
          // Se full_data é uma string JSON, fazer parse
          if (typeof fullData === 'string') {
            try {
              fullData = JSON.parse(fullData);
            } catch (error) {
              console.error('Error parsing full_data JSON:', error);
              fullData = {};
            }
          }
          
          // Fallback para received_data se full_data estiver vazio
          if (!fullData || Object.keys(fullData).length === 0) {
            let receivedData = record.received_data || {};
            if (typeof receivedData === 'string') {
              try {
                receivedData = JSON.parse(receivedData);
              } catch (error) {
                console.error('Error parsing received_data JSON:', error);
                receivedData = {};
              }
            }
            fullData = receivedData;
          }
          
          console.log('🔍 Processed fullData for record:', record.objectId, fullData);
          
          // Buscar dados reais do APP na tabela app_tests usando ranked_apps
          let appData: any = {};
          let rankedAppsWithScores: Array<{appId: string, score: number}> = [];
          
          console.log('Record ranked_apps:', record.ranked_apps);
          if (record.ranked_apps && record.ranked_apps.length > 0) {
            try {
              // Calcular scores para todos os apps ranked
              rankedAppsWithScores = await Promise.all(
                record.ranked_apps.map(async (appId: string) => {
                  const appDetails = await queryData('app_tests', undefined, { objectId: appId });
                  if (appDetails && appDetails.length > 0) {
                    const appDetail = appDetails[0];
                    const score = calculateScore(fullData, appDetail);
                    return { appId, score };
                  }
                  return { appId, score: 0 };
                })
              );
              
              // Ordenar por score (maior primeiro)
              rankedAppsWithScores.sort((a, b) => b.score - a.score);
              
              // Usar o app com maior score como app principal
              const topAppId = rankedAppsWithScores[0].appId;
              const appDetails = await queryData('app_tests', undefined, { objectId: topAppId });
              if (appDetails && appDetails.length > 0) {
                appData = appDetails[0];
                console.log('App data loaded:', appData);
              }
            } catch (error) {
              console.error('Error loading app details:', error);
            }
          } else {
            console.log('No ranked_apps found for record:', record.objectId);
            // Tentar buscar por policyNumber como fallback
            try {
              const fallbackDetails = await queryData('app_tests', undefined, { policyNumber: fullData.policyNumber || fullData.PolicyNumber });
              console.log('Fallback search by policyNumber:', fallbackDetails);
              if (fallbackDetails && fallbackDetails.length > 0) {
                appData = fallbackDetails[0];
                const score = calculateScore(fullData, appData);
                rankedAppsWithScores = [{ appId: appData.objectId, score }];
                console.log('Fallback app data loaded:', appData);
              }
            } catch (error) {
              console.error('Error in fallback search:', error);
            }
          }
          
          // Fazer matching de status usando AppStatusMatching
          const carrierStatusRaw = record.carrier_status_raw || fullData.carrierStatus || fullData.CarrierStatus;
          const statusMatch = appStatusMatching.find((match: any) => 
            match.carrier_status_raw === carrierStatusRaw
          );
          
          // Calcular score baseado nos dados reais
          const score = calculateScore(fullData, appData);
          // Usar a classificação que já está salva no banco, ou calcular se não existir
          const classification = record.classification || classifyRecord(score, record.ranked_apps, fullData, appData);
          
          const transformedRecord = {
            objectId: record.objectId,
            // Dados da coluna full_data (received data)
            full_data: fullData,
            // Status matched usando AppStatusMatching
            matchedStatus: statusMatch?.carrier_status_match || statusMatch?.carrier_status_matching?.display || 'Unknown',
            // Dados do APP (dados reais da tabela app_tests)
            appPolicyNumber: appData.policyNumber || '',
            appAgentNumber: appData.agentNumber || '',
            appAgentStatus: appData.agentStatus || '',
            appFirstName: appData.firstName || '',
            appLastName: appData.lastName || '',
            appPhone: appData.phone || '',
            appDateOfBirth: appData.dateOfBirth || '',
            appPolicyValue: appData.policyValue || 0,
            appStatus: appData.status || '',
            // Dados calculados
            classification: classification,
            confirmed: record.confirmed || false,
            createdAt: record.createdAt ? (typeof record.createdAt === 'object' && record.createdAt.__type === 'Date' ? record.createdAt.iso : record.createdAt) : new Date().toISOString(),
            rankedApps: record.ranked_apps || [],
            rankedAppsWithScores: rankedAppsWithScores
          };
          
          console.log('Transformed record:', transformedRecord);
          
          return transformedRecord;
        })
      );

      setRecords(transformedRecords);
      
      // Verificar se não há dados
      if (appStatusUpdates.length === 0) {
        console.log('⚠️ No AppStatusUpdate records found');
        setError('No data found in AppStatusUpdate table. Please upload CSV data first.');
      } else if (appTests.length === 0) {
        console.log('⚠️ No app_tests records found');
        setError('No app data found. Please ensure app_tests table has data.');
      } else {
        // Verificar se os dados têm conteúdo válido
        const validRecords = transformedRecords.filter(record => 
          record.full_data && 
          Object.keys(record.full_data).length > 0 && 
          record.full_data.policyNumber
        );
        
        if (validRecords.length === 0) {
          console.log('⚠️ No valid records with policyNumber found');
          setError('No valid records found. Please check if CSV data was uploaded correctly.');
        }
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error connecting to database.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // Filtro por aba ativa baseado na classificação
    switch (activeTab) {
      case 'manual_review':
        // Registros classificados como manual_review ou needs_confirmation
        filtered = filtered.filter(record => 
          record.classification === 'manual_review' || 
          record.classification === 'needs_confirmation'
        );
        break;
      case 'new_record':
        // Registros classificados como new_record ou no_match
        filtered = filtered.filter(record => 
          record.classification === 'new_record' || 
          record.classification === 'no_match'
        );
        break;
      case 'confirmed':
        // Registros já confirmados
        filtered = filtered.filter(record => record.confirmed === true);
        break;
    }

    // Filtro por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.full_data.policyNumber?.toLowerCase().includes(term) ||
        record.full_data.agentNumber?.toLowerCase().includes(term) ||
        record.full_data.firstName?.toLowerCase().includes(term) ||
        record.full_data.lastName?.toLowerCase().includes(term) ||
        (record.appPolicyNumber && record.appPolicyNumber.toLowerCase().includes(term)) ||
        (record.appAgentNumber && record.appAgentNumber.toLowerCase().includes(term))
      );
    }

    // Calcular contadores baseados na classificação
        const newCounts = {
      manual_review: records.filter(r => r.classification === 'manual_review' || r.classification === 'needs_confirmation').length,
      new_record: records.filter(r => r.classification === 'new_record' || r.classification === 'no_match').length,
      confirmed: records.filter(r => r.confirmed === true).length
        };
    setCounts(newCounts);

    setFilteredRecords(filtered);
  };

  const formatDate = (dateString: string | Date | any) => {
    try {
      if (!dateString) return 'Not Found';
      
      // Handle Parse Date objects from Back4App
      if (typeof dateString === 'object' && dateString.__type === 'Date') {
        const date = new Date(dateString.iso);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US');
      }
      
      // Handle regular date strings and Date objects
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '-';
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  // Função para garantir que valores sejam strings antes de renderizar
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'object') {
      // Handle Parse Date objects
      if (value.__type === 'Date' && value.iso) {
        return new Date(value.iso).toLocaleDateString('en-US');
      }
      // Handle other objects
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Função para formatar data no formato YYYY-MM-DD para comparação
  const formatDateForComparison = (value: any): string => {
    if (!value) return '-';
    try {
      // Handle Parse Date objects
      if (typeof value === 'object' && value.__type === 'Date' && value.iso) {
        return new Date(value.iso).toISOString().split('T')[0];
      }
      // Handle regular date strings
      return new Date(value).toISOString().split('T')[0];
    } catch {
      return String(value);
    }
  };

  // Função para comparar valores e determinar cor de fundo do texto
  const compareValues = (csvValue: any, appValue: any, fieldType: 'text' | 'phone' | 'date' | 'number' = 'text') => {
    if (!csvValue && !appValue) return 'bg-green-100 text-green-800 px-2 py-1 rounded'; // Ambos vazios = match
    if (!csvValue || !appValue) return 'bg-red-100 text-red-800 px-2 py-1 rounded'; // Um vazio = mismatch
    
    let normalizedCsv = csvValue;
    let normalizedApp = appValue;
    
    switch (fieldType) {
      case 'phone':
        normalizedCsv = csvValue.toString().replace(/[^0-9]/g, '');
        normalizedApp = appValue.toString().replace(/[^0-9]/g, '');
        break;
      case 'date':
        try {
          normalizedCsv = new Date(csvValue).toISOString().split('T')[0];
          normalizedApp = new Date(appValue).toISOString().split('T')[0];
        } catch {
          normalizedCsv = csvValue.toString();
          normalizedApp = appValue.toString();
        }
        break;
      case 'number':
        normalizedCsv = Number(csvValue);
        normalizedApp = Number(appValue);
        break;
      default:
        normalizedCsv = csvValue.toString().toLowerCase().trim();
        normalizedApp = appValue.toString().toLowerCase().trim();
    }
    
    return normalizedCsv === normalizedApp ? 'bg-green-100 text-green-800 px-2 py-1 rounded' : 'bg-red-100 text-red-800 px-2 py-1 rounded';
  };

  // Função para calcular score baseado nos dados do CSV e APP
  const calculateScore = (csvData: any, appData: any): number => {
    let score = 0;
    
    // Debug: Log input data
    console.log('calculateScore - Input data:', {
      csvData: csvData,
      appData: appData
    });
    
    // Core Fields (max 80 points) - 20 points each
    if (csvData.policyNumber && appData.policyNumber && 
        csvData.policyNumber.toString().toLowerCase() === appData.policyNumber.toString().toLowerCase()) {
      score += 20;
    }
    
    if (csvData.phone && appData.phone && 
        csvData.phone.replace(/[^0-9]/g, '') === appData.phone.replace(/[^0-9]/g, '')) {
      score += 20;
    }
    
    if (csvData.dateOfBirth && appData.dateOfBirth) {
      try {
        const csvDate = new Date(csvData.dateOfBirth);
        const appDate = new Date(appData.dateOfBirth);
        
        // Verificar se as datas são válidas
        if (!isNaN(csvDate.getTime()) && !isNaN(appDate.getTime())) {
          const csvDOB = csvDate.toISOString().split('T')[0];
          const appDOB = appDate.toISOString().split('T')[0];
          if (csvDOB === appDOB) {
            score += 20;
          }
        }
      } catch (error) {
        console.error('Error comparing dates:', error, { csvData: csvData.dateOfBirth, appData: appData.dateOfBirth });
      }
    }
    
    if (csvData.firstName && csvData.lastName && appData.firstName && appData.lastName) {
      const csvName = `${csvData.firstName} ${csvData.lastName}`.toLowerCase().trim();
      const appName = `${appData.firstName} ${appData.lastName}`.toLowerCase().trim();
      if (csvName === appName) {
        score += 20;
      }
    }
    
    // Conditional Fields (only if ANY core field matches) - 20 points each
    const hasAnyCoreMatch = score > 0;
    
    if (hasAnyCoreMatch) {
      if (csvData.policyValue && appData.policyValue && 
          Number(csvData.policyValue) === Number(appData.policyValue)) {
        score += 20;
      }
      
      if (csvData.agentNumber && appData.agentNumber && 
          csvData.agentNumber.toString().toLowerCase() === appData.agentNumber.toString().toLowerCase()) {
        score += 20;
      }
    }
    
    // Debug: Log the score calculation
    console.log('Score calculation:', {
      csvData: {
        policyNumber: csvData.policyNumber,
        phone: csvData.phone,
        dateOfBirth: csvData.dateOfBirth,
        firstName: csvData.firstName,
        lastName: csvData.lastName,
        policyValue: csvData.policyValue,
        agentNumber: csvData.agentNumber
      },
      appData: {
        policyNumber: appData.policyNumber,
        phone: appData.phone,
        dateOfBirth: appData.dateOfBirth,
        firstName: appData.firstName,
        lastName: appData.lastName,
        policyValue: appData.policyValue,
        agentNumber: appData.agentNumber
      },
      score: score
    });
    
    return score;
  };

  // Função para classificar o record baseado no score e matching único
  const classifyRecord = (score: number, rankedApps: any[], csvData: any, appData: any): 'auto_confirm' | 'manual_review' | 'new_record' => {
    // Debug: Log classification
    console.log('Classification:', {
      score: score,
      policyNumber: csvData.policyNumber,
      agentNumber: csvData.agentNumber,
      appPolicyNumber: appData.policyNumber,
      appAgentNumber: appData.agentNumber
    });
    
    // Verificar se tem Carrier + PolicyNumber + AgentNumber match único (auto confirm)
    const hasUniqueMatch = csvData.carrier && csvData.policyNumber && csvData.agentNumber &&
                          appData.Carrier && appData.policyNumber && appData.agentNumber &&
                          csvData.carrier.toString().toLowerCase() === appData.Carrier.toString().toLowerCase() &&
                          csvData.policyNumber.toString().toLowerCase() === appData.policyNumber.toString().toLowerCase() &&
                          csvData.agentNumber.toString().toLowerCase() === appData.agentNumber.toString().toLowerCase();
    
    if (hasUniqueMatch) {
      console.log('Classification: auto_confirm (unique match)');
      return 'auto_confirm';
    }
    
    // Verificar se tem Policy + Agent match (auto confirm)
    const hasPolicyAgentMatch = csvData.policyNumber && csvData.agentNumber &&
                               appData.policyNumber && appData.agentNumber &&
                               csvData.policyNumber.toString().toLowerCase() === appData.policyNumber.toString().toLowerCase() &&
                               csvData.agentNumber.toString().toLowerCase() === appData.agentNumber.toString().toLowerCase();
    
    if (hasPolicyAgentMatch && score >= 60) {
      console.log('Classification: auto_confirm (policy+agent match)');
      return 'auto_confirm';
    }
    
    // Classificação baseada no score
    if (score >= 80) {
      console.log('Classification: auto_confirm (high score)');
      return 'auto_confirm';
    } else if (score >= 40) {
      console.log('Classification: manual_review (medium score)');
      return 'manual_review';
    } else {
      console.log('Classification: new_record (low score)');
      return 'new_record';
    }
  };

  const openModal = async (record: AppMatchingRecord) => {
    console.log('Opening modal for record:', record);
    console.log('rankedAppsWithScores:', record.rankedAppsWithScores);
    setSelectedRecord(record);
    setShowModal(true);
    setSelectedOption(null);
    if (record.rankedAppsWithScores && record.rankedAppsWithScores.length > 0) {
      console.log('Loading app details for:', record.rankedAppsWithScores);
      await loadAppDetailsWithScores(record.rankedAppsWithScores);
    } else if (record.rankedApps && record.rankedApps.length > 0) {
      console.log('Fallback to rankedApps:', record.rankedApps);
      await loadAppDetails(record.rankedApps);
    } else {
      console.log('No rankedApps found or empty');
    }
  };

  const closeModal = () => {
    setSelectedRecord(null);
    setShowModal(false);
    setSelectedOption(null);
  };

  const loadAppDetailsWithScores = async (rankedAppsWithScores: Array<{appId: string, score: number}>) => {
    try {
      console.log('loadAppDetailsWithScores called with:', rankedAppsWithScores);
      const details = await Promise.all(
        rankedAppsWithScores.map(async (appData, index) => {
          console.log(`Loading details for appId ${index}:`, appData.appId, 'with score:', appData.score);
          // Buscar dados da tabela app_tests usando o appId
          const appDetails = await queryData('app_tests', undefined, { objectId: appData.appId });
          console.log(`App details found for ${appData.appId}:`, appDetails);
          const appDetail = appDetails[0];
          if (appDetail) {
            const result = {
              ...appDetail,
              score: appData.score, // Usar o score salvo
              // Mapear campos da tabela app_tests
              policyNumber: appDetail.policyNumber,
              agentNumber: appDetail.agentNumber,
              agentStatus: appDetail.agentStatus,
              firstName: appDetail.firstName,
              lastName: appDetail.lastName,
              phone: appDetail.phone,
              dateOfBirth: appDetail.dateOfBirth,
              policyValue: appDetail.policyValue,
              status: appDetail.status,
              Carrier: appDetail.Carrier
            };
            console.log(`Processed app detail ${index}:`, result);
            return result;
          } else {
            console.log(`No app detail found for appId: ${appData.appId}`);
            return null;
          }
        })
      );
      console.log('All app details loaded:', details);
      const filteredDetails = details.filter(Boolean);
      console.log('Filtered app details:', filteredDetails);
      setAppDetails(filteredDetails);
    } catch (error) {
      console.error('Error loading app details:', error);
    }
  };

  const loadAppDetails = async (rankedApps: string[]) => {
    try {
      console.log('loadAppDetails called with:', rankedApps);
      const details = await Promise.all(
        rankedApps.map(async (appId, index) => {
          console.log(`Loading details for appId ${index}:`, appId);
          // Buscar dados da tabela app_tests usando o appId
          const appDetails = await queryData('app_tests', undefined, { objectId: appId });
          console.log(`App details found for ${appId}:`, appDetails);
          const appDetail = appDetails[0];
          if (appDetail) {
            // Calcular score baseado na comparação com os dados do CSV
            const csvData = selectedRecord ? {
              policyNumber: selectedRecord.full_data.policyNumber || selectedRecord.full_data.policynumber,
              phone: selectedRecord.full_data.phone,
              dateOfBirth: selectedRecord.full_data.dateOfBirth || selectedRecord.full_data.dateofbirth,
              firstName: selectedRecord.full_data.firstName || selectedRecord.full_data.firstname,
              lastName: selectedRecord.full_data.lastName || selectedRecord.full_data.lastname,
              policyValue: selectedRecord.full_data.policyValue || selectedRecord.full_data.policyvalue,
              agentNumber: selectedRecord.full_data.agentNumber || selectedRecord.full_data.agentnumber
            } : {};
            
            const score = calculateScore(csvData, appDetail);
            
            const result = {
              ...appDetail,
              score: score, // Calcular score baseado na comparação
              // Mapear campos da tabela app_tests
              policyNumber: appDetail.policyNumber,
              agentNumber: appDetail.agentNumber,
              agentStatus: appDetail.agentStatus,
              firstName: appDetail.firstName,
              lastName: appDetail.lastName,
              phone: appDetail.phone,
              dateOfBirth: appDetail.dateOfBirth,
              policyValue: appDetail.policyValue,
              status: appDetail.status,
              Carrier: appDetail.Carrier
            };
            console.log(`Processed app detail ${index}:`, result);
            return result;
          } else {
            console.log(`No app detail found for appId: ${appId}`);
            return null;
          }
        })
      );
      console.log('All app details loaded:', details);
      const filteredDetails = details.filter(Boolean);
      console.log('Filtered app details:', filteredDetails);
      setAppDetails(filteredDetails);
    } catch (error) {
      console.error('Error loading app details:', error);
    }
  };

  const handleConfirmChanges = () => {
    if (selectedOption) {
      setIsConfirmModalOpen(true);
    }
  };

  // Função para criar log de auditoria
  const createAuditLog = async (recordId: string, action: string, decision: string, details: any) => {
    try {
      const auditLog = {
        APP: recordId,
        status_before: 'pending',
        status_change_date: new Date().toISOString(),
        status_now: decision,
        action: action,
        details: JSON.stringify(details),
        timestamp: new Date().toISOString(),
        user: 'system' // ou usuário logado
      };
      
      // Aqui você faria a chamada para inserir o log na tabela AppStatusLog
      // await insertData('AppStatusLog', auditLog);
      
      console.log('Audit log created:', auditLog);
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  };

  // Função para abrir modal de edição (Undo Update)
  const handleUndoUpdate = (record: AppMatchingRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  // Função para auto-confirmar um record
  const handleAutoConfirm = async (record: AppMatchingRecord) => {
    try {
      console.log('Auto confirming record:', record.objectId);
      
      // Criar log de auditoria
      await createAuditLog(record.objectId, 'auto_confirm', 'confirmed', {
        classification: record.classification,
        csvData: {
          policyNumber: record.full_data.policyNumber || record.full_data.policynumber,
          agentNumber: record.full_data.agentNumber || record.full_data.agentnumber,
          firstName: record.full_data.firstName || record.full_data.firstname,
          lastName: record.full_data.lastName || record.full_data.lastname
        }
      });
      
      // Atualizar o record na tabela AppStatusUpdate
      const updateData = {
        confirmed: true,
        date_confirmed: new Date().toISOString()
      };
      
      // Aqui você faria a chamada para atualizar o record no Back4App
      // await updateData('AppStatusUpdate', record.objectId, updateData);
      
      console.log('Record auto-confirmed successfully');
      
      // Recarregar os dados
      await loadData();
      
    } catch (error) {
      console.error('Error auto-confirming record:', error);
    }
  };

  const handleFinalConfirm = async () => {
    if (!selectedOption || !selectedRecord) return;
    
    try {
      console.log('Final confirmation for option:', selectedOption);
      
      // Criar log de auditoria
      await createAuditLog(selectedRecord.objectId, 'manual_confirm', 'confirmed', {
        selectedOption: selectedOption,
        score: selectedRecord.score,
        classification: selectedRecord.classification,
        csvData: {
          policyNumber: selectedRecord.full_data.policyNumber || selectedRecord.full_data.policynumber,
          agentNumber: selectedRecord.full_data.agentNumber || selectedRecord.full_data.agentnumber,
          firstName: selectedRecord.full_data.firstName || selectedRecord.full_data.firstname,
          lastName: selectedRecord.full_data.lastName || selectedRecord.full_data.lastname
        }
      });
      
      // Atualizar o record na tabela AppStatusUpdate
      const updateData = {
        confirmed: true,
        date_confirmed: new Date().toISOString()
      };
      
      // Aqui você faria a chamada para atualizar o record no Back4App
      // await updateData('AppStatusUpdate', selectedRecord.objectId, updateData);
      
      console.log('Record confirmed successfully');
      
      // Fechar modais e recarregar dados
      setIsConfirmModalOpen(false);
      setShowModal(false);
      setSelectedRecord(null);
      setSelectedOption(null);
      await loadData();
      
    } catch (error) {
      console.error('Error confirming record:', error);
    }
  };

  const handleCancelConfirm = () => {
    setIsConfirmModalOpen(false);
  };

  const handleCreateRecord = (record: AppMatchingRecord) => {
    setSelectedRecord(record);
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreate = async () => {
    if (!selectedRecord) return;
    
    try {
      console.log('Creating record:', selectedRecord);
      
      // Criar log de auditoria
      await createAuditLog(selectedRecord.objectId, 'create_new', 'new_record', {
        score: selectedRecord.score,
        classification: selectedRecord.classification,
        csvData: {
          policyNumber: selectedRecord.full_data.policyNumber || selectedRecord.full_data.policynumber,
          agentNumber: selectedRecord.full_data.agentNumber || selectedRecord.full_data.agentnumber,
          firstName: selectedRecord.full_data.firstName || selectedRecord.full_data.firstname,
          lastName: selectedRecord.full_data.lastName || selectedRecord.full_data.lastname,
          policyValue: selectedRecord.full_data.policyValue || selectedRecord.full_data.policyvalue,
          carrierStatus: selectedRecord.full_data.status
        }
      });
      
      // Aqui você faria a chamada para criar um novo record na tabela app_tests
      // const newAppData = {
      //   policyNumber: selectedRecord.full_data.policyNumber || selectedRecord.full_data.policynumber,
      //   agentNumber: selectedRecord.full_data.agentNumber || selectedRecord.full_data.agentnumber,
      //   firstName: selectedRecord.full_data.firstName || selectedRecord.full_data.firstname,
      //   lastName: selectedRecord.full_data.lastName || selectedRecord.full_data.lastname,
      //   phone: selectedRecord.full_data.phone,
      //   dateOfBirth: selectedRecord.full_data.dateOfBirth || selectedRecord.full_data.dateofbirth,
      //   policyValue: selectedRecord.full_data.policyValue || selectedRecord.full_data.policyvalue,
      //   status: selectedRecord.matchedStatus || 'Active',
      //   Carrier: 'AMERICAN AMICABLE'
      // };
      // await insertData('app_tests', newAppData);
      
      console.log('New record created successfully');
      
      // Fechar modal e recarregar dados
      setIsCreateModalOpen(false);
      setSelectedRecord(null);
      await loadData();
      
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false);
    setSelectedRecord(null);
  };

  // Função para limpar uma tabela específica
  const handleClearTable = async (tableName: string) => {
    if (!confirm(`Tem certeza que deseja apagar TODOS os dados da tabela ${tableName}? Esta ação não pode ser desfeita!`)) {
      return;
    }

    try {
      setIsClearing(true);
      console.log(`🗑️ Limpando tabela ${tableName}...`);
      
      const result = await deleteAllData(tableName);
      setClearResults(prev => [...prev, { table: tableName, ...result, timestamp: new Date().toISOString() }]);
      
      // Recarregar dados após limpeza
      await loadData();
      
      alert(`Tabela ${tableName} limpa com sucesso! ${result.deleted} registros deletados.`);
    } catch (error) {
      console.error(`Erro ao limpar tabela ${tableName}:`, error);
      alert(`Erro ao limpar tabela ${tableName}: ${error.message}`);
    } finally {
      setIsClearing(false);
    }
  };

  // Função para limpar todas as tabelas
  const handleClearAllTables = async () => {
    if (!confirm('Tem certeza que deseja apagar TODOS os dados de TODAS as tabelas? Esta ação não pode ser desfeita!')) {
      return;
    }

    try {
      setIsClearing(true);
      console.log('🧹 Limpando todas as tabelas...');
      
      const results = await clearAllTables();
      setClearResults(prev => [...prev, ...results.map((r: any) => ({ ...r, timestamp: new Date().toISOString() }))]);
      
      // Recarregar dados após limpeza
      await loadData();
      
      const totalDeleted = results.reduce((sum: number, r: any) => sum + (r.deleted || 0), 0);
      const totalErrors = results.reduce((sum: number, r: any) => sum + (r.errors || 0), 0);
      
      alert(`Limpeza concluída! ${totalDeleted} registros deletados, ${totalErrors} erros.`);
    } catch (error) {
      console.error('Erro ao limpar tabelas:', error);
      alert(`Erro ao limpar tabelas: ${error.message}`);
    } finally {
      setIsClearing(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-12 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={loadData} className="px-4 py-2 border rounded">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Matching List
            <div className="flex gap-2">
              <button 
                onClick={loadData} 
                className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Load Data
              </button>
              <button 
                onClick={checkTablesExist} 
                className="px-3 py-1 border rounded text-sm bg-green-100 hover:bg-green-200 text-green-700"
              >
                Check Tables
              </button>
              <button 
                onClick={async () => {
                  setLoading(true);
                  const exampleData = await loadExampleData();
                  setRecords([]);
                  setRecords(exampleData.map(record => ({
                    objectId: record.objectId,
                    full_data: JSON.parse(record.full_data),
                    matchedStatus: 'Unknown',
                    appPolicyNumber: '',
                    appAgentNumber: '',
                    appAgentStatus: '',
                    appFirstName: '',
                    appLastName: '',
                    appPhone: '',
                    appDateOfBirth: '',
                    appPolicyValue: 0,
                    appStatus: '',
                    classification: record.classification as 'auto_confirm' | 'manual_review' | 'new_record',
                    confirmed: record.confirmed,
                    createdAt: record.createdAt,
                    rankedApps: record.ranked_apps || [],
                    rankedAppsWithScores: []
                  })));
                  setLoading(false);
                }}
                className="px-3 py-1 border rounded text-sm bg-blue-100 hover:bg-blue-200"
              >
                Load Example Data
              </button>
              <button 
                onClick={() => handleClearTable('AppStatusUpdate')}
                className="px-3 py-1 border rounded text-sm bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50"
                disabled={isClearing}
              >
                Clear AppStatusUpdate
              </button>
              <button 
                onClick={() => handleClearTable('app_tests')}
                className="px-3 py-1 border rounded text-sm bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50"
                disabled={isClearing}
              >
                Clear app_tests
              </button>
              <button 
                onClick={handleClearAllTables}
                className="px-3 py-1 border rounded text-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                disabled={isClearing}
              >
                {isClearing ? 'Clearing...' : 'Clear All Tables'}
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Counters */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{counts.manual_review || 0}</div>
              <div className="text-sm text-yellow-800">Manual Review</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{counts.new_record || 0}</div>
              <div className="text-sm text-red-800">New Record</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{counts.confirmed || 0}</div>
              <div className="text-sm text-green-800">Confirmed</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('manual_review')}
                className={`px-4 py-2 rounded text-sm ${
                  activeTab === 'manual_review' 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                    : 'bg-white border hover:bg-gray-50 text-gray-700'
                }`}
              >
                Manual Review ({counts.manual_review})
              </button>
              <button
                onClick={() => setActiveTab('new_record')}
                className={`px-4 py-2 rounded text-sm ${
                  activeTab === 'new_record' 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-white border hover:bg-gray-50 text-gray-700'
                }`}
              >
                New Record ({counts.new_record})
              </button>
              <button
                onClick={() => setActiveTab('confirmed')}
                className={`px-4 py-2 rounded text-sm ${
                  activeTab === 'confirmed' 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-white border hover:bg-gray-50 text-gray-700'
                }`}
              >
                Confirmed ({counts.confirmed})
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredRecords.length} records
              {tablesExist && <span className="ml-2 text-green-600">• Tables exist</span>}
              {!tablesExist && <span className="ml-2 text-orange-600">• Tables not checked</span>}
            </div>
            <div className="text-sm text-gray-500">
              {activeTab === 'manual_review' && 'Records requiring manual review and app selection'}
              {activeTab === 'new_record' && 'New records to be created from received data'}
              {activeTab === 'confirmed' && 'Confirmed records with received vs app data comparison'}
            </div>
          </div>

          {/* Clear Results */}
          {clearResults.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Clear Results:</h4>
              <div className="space-y-2">
                {clearResults.map((result, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{result.table}:</span>
                    <span className="ml-2 text-green-600">{result.deleted || 0} deleted</span>
                    {result.errors > 0 && (
                      <span className="ml-2 text-red-600">{result.errors} errors</span>
                    )}
                    <span className="ml-2 text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setClearResults([])}
                className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50 mt-2"
              >
                Clear Results
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {activeTab === 'manual_review' ? (
                  <>
                    <TableHead>Date</TableHead>
                    <TableHead>Policy Number</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Agent ID</TableHead>
                    <TableHead>Agent Status</TableHead>
                    <TableHead>Prem. Amount</TableHead>
                    <TableHead>Carrier Status</TableHead>
                    <TableHead>Apps Found</TableHead>
                    <TableHead>Action</TableHead>
                  </>
                ) : activeTab === 'new_record' ? (
                  <>
                    <TableHead>Date</TableHead>
                    <TableHead>Policy Number</TableHead>
                    <TableHead>Agent ID</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Agent Status</TableHead>
                    <TableHead>Prem. Amount</TableHead>
                    <TableHead>Carrier Status</TableHead>
                    <TableHead>Action</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Policy Number</TableHead>
                    <TableHead className="text-center">Agent ID</TableHead>
                    <TableHead className="text-center">Client Name</TableHead>
                    <TableHead className="text-center">Agent Status</TableHead>
                    <TableHead className="text-center">Date of Birth</TableHead>
                    <TableHead className="text-center">Phone</TableHead>
                    <TableHead className="text-center">Prem. Amount</TableHead>
                    <TableHead className="text-center">Carrier Status</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Action</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record, index) => {
                if (activeTab === 'manual_review') {
                  // Manual Review: Mostrar dados received e botão para selecionar app
                  return (
                    <TableRow key={record.objectId} className="bg-yellow-50">
                      <TableCell>{formatDate(record.createdAt)}</TableCell>
                      <TableCell className="font-medium text-blue-600">{safeString(record.full_data.policyNumber || record.full_data.policynumber)}</TableCell>
                      <TableCell className="text-blue-600">{`${safeString(record.full_data.firstName || record.full_data.firstname)} ${safeString(record.full_data.lastName || record.full_data.lastname)}`}</TableCell>
                      <TableCell className="text-blue-600">{safeString(record.full_data.agentNumber || record.full_data.agentnumber)}</TableCell>
                      <TableCell className="text-blue-600">{safeString(record.full_data.agentstatus)}</TableCell>
                      <TableCell className="text-blue-600">${safeString(record.full_data.policyValue || record.full_data.policyvalue)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">Raw: {safeString(record.full_data.status)}</div>
                          <div className="text-sm font-medium text-blue-600">Matched: {safeString(record.matchedStatus) || 'Unknown'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          {record.rankedAppsWithScores?.length || record.rankedApps?.length || 0} apps
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button 
                          onClick={() => openModal(record)}
                          className="px-3 py-1 rounded text-sm bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          Select App
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                } else if (activeTab === 'new_record') {
                  // New Record: Mostrar apenas linha received com botão create
                  return (
                    <TableRow key={record.objectId} className="bg-red-50">
                      <TableCell>{formatDate(record.createdAt)}</TableCell>
                      <TableCell className="font-medium text-blue-600">{safeString(record.full_data.policyNumber || record.full_data.policynumber)}</TableCell>
                      <TableCell className="text-blue-600">{safeString(record.full_data.agentNumber || record.full_data.agentnumber)}</TableCell>
                      <TableCell className="text-blue-600">{`${safeString(record.full_data.firstName || record.full_data.firstname)} ${safeString(record.full_data.lastName || record.full_data.lastname)}`}</TableCell>
                      <TableCell className="text-blue-600">{safeString(record.full_data.agentstatus)}</TableCell>
                      <TableCell className="text-blue-600">${safeString(record.full_data.policyValue || record.full_data.policyvalue)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">Raw: {safeString(record.full_data.status)}</div>
                          <div className="text-sm font-medium text-blue-600">Matched: {safeString(record.matchedStatus) || 'Unknown'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button 
                          onClick={() => handleCreateRecord(record)}
                          className="px-3 py-1 rounded text-sm bg-green-600 hover:bg-green-700 text-white"
                        >
                          Create
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                } else if (activeTab === 'confirmed') {
                  // Confirmed: Mostrar apenas linha received comparando com app encontrado
                  return (
                    <TableRow key={record.objectId} className="bg-green-50">
                      <TableCell>{formatDate(record.createdAt)}</TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="font-medium text-blue-600">Received: {safeString(record.full_data.policyNumber || record.full_data.policynumber)}</div>
                          <div className={`text-sm ${compareValues(record.full_data.policyNumber || record.full_data.policynumber, record.appPolicyNumber)}`}>
                            App: {safeString(record.appPolicyNumber) || 'Not Found'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="font-medium text-blue-600">Received: {safeString(record.full_data.agentNumber || record.full_data.agentnumber)}</div>
                          <div className={`text-sm ${compareValues(record.full_data.agentNumber || record.full_data.agentnumber, record.appAgentNumber)}`}>
                            App: {safeString(record.appAgentNumber) || 'Not Found'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="font-medium text-blue-600">Received: {safeString(record.full_data.firstName || record.full_data.firstname)} {safeString(record.full_data.lastName || record.full_data.lastname)}</div>
                          <div className={`text-sm ${compareValues(`${record.full_data.firstName || record.full_data.firstname} ${record.full_data.lastName || record.full_data.lastname}`, `${record.appFirstName} ${record.appLastName}`)}`}>
                            App: {safeString(record.appFirstName)} {safeString(record.appLastName)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="font-medium text-blue-600">Received: {safeString(record.full_data.agentstatus)}</div>
                          <div className={`text-sm ${compareValues(record.full_data.agentstatus, record.appAgentStatus)}`}>
                            App: {safeString(record.appAgentStatus) || 'Not Found'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="font-medium text-blue-600">Received: {formatDate(record.full_data.dateOfBirth || record.full_data.dateofbirth)}</div>
                          <div className={`text-sm ${compareValues(formatDateForComparison(record.full_data.dateOfBirth || record.full_data.dateofbirth), formatDateForComparison(record.appDateOfBirth), 'date')}`}>
                            App: {formatDateForComparison(record.appDateOfBirth) || 'Not Found'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="font-medium text-blue-600">Received: {formatPhone(record.full_data.phone)}</div>
                          <div className={`text-sm ${compareValues(record.full_data.phone, record.appPhone, 'phone')}`}>
                            App: {formatPhone(record.appPhone) || 'Not Found'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="font-medium text-blue-600">Received: ${safeString(record.full_data.policyValue || record.full_data.policyvalue)}</div>
                          <div className={`text-sm ${compareValues(record.full_data.policyValue || record.full_data.policyvalue, record.appPolicyValue, 'number')}`}>
                            App: ${safeString(record.appPolicyValue) || 0}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="font-medium text-blue-600">Received: {safeString(record.full_data.status)}</div>
                          <div className={`text-sm ${compareValues(record.full_data.status, record.appStatus)}`}>
                            App: {safeString(record.appStatus) || 'Not Found'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="font-medium text-blue-600">Received: {safeString(record.matchedStatus)}</div>
                          <div className="text-sm text-green-600 font-medium">Confirmed</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <button 
                          onClick={() => handleUndoUpdate(record)}
                          className="px-3 py-1 border rounded text-sm text-orange-600 border-orange-600 hover:bg-orange-50"
                        >
                          Undo Update
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                }
                
                return null;
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Choose Option Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ padding: 0, margin: 0 }}>
          <div className="bg-white rounded-lg shadow-xl w-[95vw] max-w-[1920px] max-h-[90vh] overflow-hidden flex flex-col" style={{ margin: '16px' }}>
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Select App to Match</h2>
                  {selectedRecord && (
                    <p className="text-sm text-gray-600 mt-1">
                      Received data compared with {appDetails.length} apps found
                    </p>
                  )}
                        </div>
                <button 
                  className="px-3 py-1 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
                  disabled={!selectedOption}
                  onClick={handleConfirmChanges}
                >
                  Confirm Changes
                </button>
                        </div>
                        </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedRecord && (
                <div className="space-y-4">
                  {/* Options Table */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800">Available Apps (with calculated scores):</h3>
                    <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Select</TableHead>
                        <TableHead>Policy Number</TableHead>
                        <TableHead>Agent ID</TableHead>
                            <TableHead>Client Name</TableHead>
                        <TableHead>Agent Status</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Phone</TableHead>
                            <TableHead>Premium Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-16">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Reference Row - Received Data (Full Data) */}
                      <TableRow className="bg-blue-50 border-blue-200">
                        <TableCell>
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">R</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-blue-600">{safeString(selectedRecord.full_data.policyNumber || selectedRecord.full_data.policynumber)}</TableCell>
                        <TableCell className="text-blue-600">{safeString(selectedRecord.full_data.agentNumber || selectedRecord.full_data.agentnumber)}</TableCell>
                        <TableCell className="text-blue-600">{`${safeString(selectedRecord.full_data.firstName || selectedRecord.full_data.firstname)} ${safeString(selectedRecord.full_data.lastName || selectedRecord.full_data.lastname)}`}</TableCell>
                        <TableCell className="text-blue-600">{safeString(selectedRecord.full_data.agentstatus)}</TableCell>
                        <TableCell className="text-blue-600">{formatDate(selectedRecord.full_data.dateOfBirth || selectedRecord.full_data.dateofbirth)}</TableCell>
                        <TableCell className="text-blue-600">{formatPhone(selectedRecord.full_data.phone)}</TableCell>
                        <TableCell className="text-blue-600">${selectedRecord.full_data.policyValue || selectedRecord.full_data.policyvalue?.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-blue-600">{safeString(selectedRecord.full_data.status)}</TableCell>
                        <TableCell>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-blue-500">
                            REF
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Options Rows - App Data */}
                          {appDetails.map((app: any, index: number) => {
                            const isSelected = selectedOption === app.objectId;
                            const appScore = app.score || 0;
                            const rowColors = [
                              'bg-green-50 border-green-200', // First option - green
                              'bg-yellow-50 border-yellow-200', // Second option - yellow
                              'bg-purple-50 border-purple-200', // Third option - purple
                              'bg-pink-50 border-pink-200', // Fourth option - pink
                              'bg-indigo-50 border-indigo-200' // Fifth option - indigo
                            ];
                            const rowColor = rowColors[index % rowColors.length];
                            
                            return (
                              <TableRow 
                                key={app.objectId}
                                className={`cursor-pointer transition-colors ${
                                  isSelected ? `${rowColor} ring-2 ring-blue-500` : `${rowColor} hover:opacity-80`
                                }`}
                                onClick={() => setSelectedOption(isSelected ? null : app.objectId)}
                              >
                      <TableCell>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => setSelectedOption(isSelected ? null : app.objectId)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                  />
                      </TableCell>
                                <TableCell className="font-medium">{app.policyNumber || '-'}</TableCell>
                                <TableCell>{app.agentNumber || '-'}</TableCell>
                                <TableCell>{`${app.firstName || ''} ${app.lastName || ''}`}</TableCell>
                                <TableCell>{app.agentStatus || '-'}</TableCell>
                                <TableCell>{formatDate(app.dateOfBirth)}</TableCell>
                                <TableCell>{formatPhone(app.phone)}</TableCell>
                                <TableCell>${app.policyValue?.toLocaleString() || '-'}</TableCell>
                                <TableCell>{app.status || 'Active'}</TableCell>
                      <TableCell>
                                  <div 
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                      appScore >= 90 ? 'bg-green-500' : 
                                      appScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                  >
                                    {appScore}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
              })}
            </TableBody>
          </Table>
                </div>
                  </div>
                    </div>
              )}
              </div>

            {/* Footer */}
            <div className="p-6 border-t">
              <button 
                onClick={closeModal}
                className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ padding: 0, margin: 0 }}>
          <div className="bg-white rounded-lg shadow-xl w-[95vw] max-w-[1920px]" style={{ margin: '16px' }}>
            {/* Header */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Confirm Changes</h2>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to confirm this selection? This action will update the record status.
              </p>
              {selectedRecord && selectedOption && (
                <div className="p-4 rounded-lg bg-gray-50 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                      <span className="font-medium text-gray-800">Policy Number:</span>
                      <span className="ml-2 text-gray-600">{safeString(selectedRecord.full_data.policyNumber || selectedRecord.full_data.policynumber)}</span>
                </div>
              <div>
                      <span className="font-medium text-gray-800">Client:</span>
                      <span className="ml-2 text-gray-600">{`${safeString(selectedRecord.full_data.firstName || selectedRecord.full_data.firstname)} ${safeString(selectedRecord.full_data.lastName || selectedRecord.full_data.lastname)}`}</span>
                    </div>
                  </div>
                </div>
              )}
              </div>

            {/* Footer */}
            <div className="p-6 border-t flex gap-2 justify-end">
                          <button 
                onClick={handleCancelConfirm}
                className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </button>
                          <button 
                onClick={handleFinalConfirm}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
              >
                Confirm
              </button>
                        </div>
          </div>
        </div>
      )}

      {/* Create Record Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ padding: 0, margin: 0 }}>
          <div className="bg-white rounded-lg shadow-xl w-[95vw] max-w-[1920px]" style={{ margin: '16px' }}>
            {/* Header */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Create New Record</h2>
                        </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to create this new record? This action will add the record to the system.
              </p>
              {selectedRecord && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Received Data (Full Data):</h3>
                  <div className="p-4 rounded-lg bg-blue-50 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-800">Policy Number:</span>
                        <span className="ml-2 text-gray-600">{safeString(selectedRecord.full_data.policyNumber || selectedRecord.full_data.policynumber)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Agent Number:</span>
                        <span className="ml-2 text-gray-600">{safeString(selectedRecord.full_data.agentNumber || selectedRecord.full_data.agentnumber)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">First Name:</span>
                        <span className="ml-2 text-gray-600">{safeString(selectedRecord.full_data.firstName || selectedRecord.full_data.firstname)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Last Name:</span>
                        <span className="ml-2 text-gray-600">{safeString(selectedRecord.full_data.lastName || selectedRecord.full_data.lastname)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Phone:</span>
                        <span className="ml-2 text-gray-600">{formatPhone(selectedRecord.full_data.phone)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Date of Birth:</span>
                        <span className="ml-2 text-gray-600">{formatDate(selectedRecord.full_data.dateOfBirth || selectedRecord.full_data.dateofbirth)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Policy Value:</span>
                        <span className="ml-2 text-gray-600">${safeString(selectedRecord.full_data.policyValue || selectedRecord.full_data.policyvalue)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Agent Status:</span>
                        <span className="ml-2 text-gray-600">{safeString(selectedRecord.full_data.agentstatus)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Carrier Status:</span>
                        <span className="ml-2 text-gray-600">{safeString(selectedRecord.full_data.status)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Matched Status:</span>
                        <span className="ml-2 text-gray-600">{safeString(selectedRecord.matchedStatus)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex gap-2 justify-end">
                          <button 
                onClick={handleCancelCreate}
                className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmCreate}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
              >
                Create Record
              </button>
                        </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {isEditModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ padding: 0, margin: 0 }}>
          <div className="bg-white rounded-lg shadow-xl w-[95vw] max-w-[1920px]" style={{ margin: '16px' }}>
            {/* Header */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Edit Record - Undo Update</h2>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Review and edit the record data. Changes will be applied to the system.
              </p>
              
              {/* Comparison Table */}
              <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                    <TableRow>
                                <TableHead>Field</TableHead>
                      <TableHead>Received Data</TableHead>
                      <TableHead>App Found Data</TableHead>
                      <TableHead>Edit</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">Policy Number</TableCell>
                      <TableCell>{safeString(selectedRecord.full_data.policyNumber || selectedRecord.full_data.policynumber)}</TableCell>
                                <TableCell>
                        <span className={compareValues(selectedRecord.full_data.policyNumber || selectedRecord.full_data.policynumber, selectedRecord.appPolicyNumber)}>
                          {safeString(selectedRecord.appPolicyNumber) || 'Not Found'}
                                  </span>
                                </TableCell>
                                <TableCell>
                        <Input 
                          defaultValue={safeString(selectedRecord.appPolicyNumber) || safeString(selectedRecord.full_data.policyNumber || selectedRecord.full_data.policynumber)}
                          className="w-32"
                        />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Agent ID</TableCell>
                      <TableCell>{safeString(selectedRecord.full_data.agentNumber || selectedRecord.full_data.agentnumber)}</TableCell>
                                <TableCell>
                        <span className={compareValues(selectedRecord.full_data.agentNumber || selectedRecord.full_data.agentnumber, selectedRecord.appAgentNumber)}>
                          {safeString(selectedRecord.appAgentNumber) || 'Not Found'}
                                  </span>
                                </TableCell>
                                <TableCell>
                        <Input 
                          defaultValue={safeString(selectedRecord.appAgentNumber) || safeString(selectedRecord.full_data.agentNumber || selectedRecord.full_data.agentnumber)}
                          className="w-32"
                        />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Agent Status</TableCell>
                      <TableCell>{safeString(selectedRecord.full_data.agentstatus)}</TableCell>
                                <TableCell>
                        <span className={compareValues(selectedRecord.full_data.agentstatus, selectedRecord.appAgentStatus)}>
                          {safeString(selectedRecord.appAgentStatus) || 'Not Found'}
                                  </span>
                                </TableCell>
                                <TableCell>
                        <select 
                          defaultValue={safeString(selectedRecord.appAgentStatus) || safeString(selectedRecord.full_data.agentstatus)}
                          className="w-32 px-2 py-1 border rounded"
                        >
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                      <TableCell className="font-medium">Client Name</TableCell>
                      <TableCell>{safeString(selectedRecord.full_data.firstName || selectedRecord.full_data.firstname)} {safeString(selectedRecord.full_data.lastName || selectedRecord.full_data.lastname)}</TableCell>
                                <TableCell>
                        <span className={compareValues(`${selectedRecord.full_data.firstName || selectedRecord.full_data.firstname} ${selectedRecord.full_data.lastName || selectedRecord.full_data.lastname}`, `${selectedRecord.appFirstName} ${selectedRecord.appLastName}`)}>
                          {safeString(selectedRecord.appFirstName)} {safeString(selectedRecord.appLastName)}
                                  </span>
                      </TableCell>
                                <TableCell>
                        <div className="flex gap-2">
                          <Input 
                            defaultValue={safeString(selectedRecord.appFirstName) || safeString(selectedRecord.full_data.firstName || selectedRecord.full_data.firstname)}
                            placeholder="First Name"
                            className="w-24"
                          />
                          <Input 
                            defaultValue={safeString(selectedRecord.appLastName) || safeString(selectedRecord.full_data.lastName || selectedRecord.full_data.lastname)}
                            placeholder="Last Name"
                            className="w-24"
                          />
                        </div>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Phone</TableCell>
                      <TableCell>{safeString(selectedRecord.full_data.phone)}</TableCell>
                                <TableCell>
                        <span className={compareValues(selectedRecord.full_data.phone, selectedRecord.appPhone, 'phone')}>
                          {safeString(selectedRecord.appPhone) || 'Not Found'}
                                  </span>
                      </TableCell>
                                <TableCell>
                        <Input 
                          defaultValue={safeString(selectedRecord.appPhone) || safeString(selectedRecord.full_data.phone)}
                          className="w-32"
                        />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                      <TableCell className="font-medium">Date of Birth</TableCell>
                      <TableCell>{safeString(selectedRecord.full_data.dateOfBirth || selectedRecord.full_data.dateofbirth)}</TableCell>
                                <TableCell>
                        <span className={compareValues(formatDateForComparison(selectedRecord.full_data.dateOfBirth || selectedRecord.full_data.dateofbirth), formatDateForComparison(selectedRecord.appDateOfBirth), 'date')}>
                          {formatDateForComparison(selectedRecord.appDateOfBirth) || 'Not Found'}
                                  </span>
                      </TableCell>
                                <TableCell>
                        <Input 
                          type="date"
                          defaultValue={safeString(selectedRecord.appDateOfBirth) || safeString(selectedRecord.full_data.dateOfBirth || selectedRecord.full_data.dateofbirth)}
                          className="w-32"
                        />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                      <TableCell className="font-medium">Premium Amount</TableCell>
                      <TableCell>${safeString(selectedRecord.full_data.policyValue || selectedRecord.full_data.policyvalue)}</TableCell>
                                <TableCell>
                        <span className={compareValues(selectedRecord.full_data.policyValue || selectedRecord.full_data.policyvalue, selectedRecord.appPolicyValue, 'number')}>
                          ${safeString(selectedRecord.appPolicyValue) || 0}
                                  </span>
                      </TableCell>
                                <TableCell>
                        <Input 
                          type="number"
                          defaultValue={safeString(selectedRecord.appPolicyValue) || safeString(selectedRecord.full_data.policyValue || selectedRecord.full_data.policyvalue)}
                          className="w-32"
                        />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Status</TableCell>
                      <TableCell>{safeString(selectedRecord.full_data.status)}</TableCell>
                                <TableCell>
                        <span className={compareValues(selectedRecord.full_data.status, selectedRecord.appStatus)}>
                          {safeString(selectedRecord.appStatus) || 'Not Found'}
                        </span>
                                </TableCell>
                                <TableCell>
                        <select 
                          defaultValue={safeString(selectedRecord.appStatus) || safeString(selectedRecord.full_data.status)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>

            {/* Footer */}
            <div className="p-6 border-t flex gap-2 justify-end">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // TODO: Implement save functionality
                  console.log('Save edited record:', selectedRecord.objectId);
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
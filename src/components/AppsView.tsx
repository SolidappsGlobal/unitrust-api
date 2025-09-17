import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { RefreshCw, Search, Database } from 'lucide-react';
import { queryData } from '../utils/back4app-queries';

interface AppRecord {
  objectId: string;
  policyNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  policyValue: number;
  agentNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AppsView() {
  const [apps, setApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tablesExist, setTablesExist] = useState(false);

  // Commented to avoid automatic table creation
  // useEffect(() => {
  //   loadData();
  // }, []);

  useEffect(() => {
    applyFilters();
  }, [apps, searchTerm]);

  // Function to check if tables exist without creating columns
  const checkTablesExist = async () => {
    try {
      console.log('🔍 Verificando se as tabelas existem...');
      
      // Tentar fazer uma query simples para verificar se as tabelas existem
      // Usar limit: 0 para evitar criar colunas
      const appTests = await queryData('app_tests', undefined, { limit: 0 });
      
      console.log('✅ Tabela app_tests existe:', appTests.length);
      setTablesExist(true);
      return true;
    } catch (error) {
      console.log('⚠️ app_tests table does not exist or error checking:', error);
      setTablesExist(false);
      return false;
    }
  };

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Verificar se as tabelas existem primeiro
      const tablesExist = await checkTablesExist();
      if (!tablesExist) {
        console.log('⚠️ app_tests table does not exist, cannot load data');
        setError('app_tests table does not exist. Use the "Check Tables" button first.');
        setLoading(false);
        return;
      }
      
      // Fetch data from app_tests table
      const appData = await queryData('app_tests');
      
      // Transform data to expected format
      const transformedApps: AppRecord[] = appData.map((record: any) => ({
        objectId: record.objectId || record.id,
        policyNumber: record.policyNumber || record.get?.('policyNumber') || '',
        firstName: record.firstName || record.get?.('firstName') || '',
        lastName: record.lastName || record.get?.('lastName') || '',
        phone: record.phone || record.get?.('phone') || '',
        dateOfBirth: record.dateOfBirth || record.get?.('dateOfBirth') || '',
        policyValue: record.policyValue || record.get?.('policyValue') || 0,
        agentNumber: record.agentNumber || record.get?.('agentNumber') || '',
        status: record.status || record.get?.('status') || 'Unknown',
        createdAt: record.createdAt || record.get?.('createdAt') || '',
        updatedAt: record.updatedAt || record.get?.('updatedAt') || ''
      }));

      setApps(transformedApps);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error connecting to database.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...apps];

    // Filtro por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.policyNumber.toLowerCase().includes(term) ||
        app.firstName.toLowerCase().includes(term) ||
        app.lastName.toLowerCase().includes(term) ||
        app.agentNumber.toLowerCase().includes(term) ||
        app.phone.toLowerCase().includes(term)
      );
    }

    setFilteredApps(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      case 'declined':
        return <Badge className="bg-gray-100 text-gray-800">Declined</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US');
    } catch {
      return dateString;
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '-';
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
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
          <button 
            onClick={loadData} 
            className="px-4 py-2 border rounded bg-white hover:bg-gray-50 flex items-center"
          >
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
            <Database className="w-5 h-5" />
            Apps (app_tests)
            <div className="flex gap-2">
              <button 
                onClick={loadData} 
                className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50 flex items-center"
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
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by Policy Number, Name, Agent ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-10"
                />
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredApps.length} of {apps.length} records
            {tablesExist && <span className="ml-2 text-green-600">• Tables exist</span>}
            {!tablesExist && <span className="ml-2 text-orange-600">• Tables not checked</span>}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Number</TableHead>
                <TableHead>Agent ID</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Policy Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApps.map((app) => (
                <TableRow key={app.objectId}>
                  <TableCell className="font-medium">
                    {app.policyNumber}
                  </TableCell>
                  <TableCell>
                    {app.agentNumber}
                  </TableCell>
                  <TableCell>
                    {app.firstName} {app.lastName}
                  </TableCell>
                  <TableCell>
                    {formatPhone(app.phone)}
                  </TableCell>
                  <TableCell>
                    {formatDate(app.dateOfBirth)}
                  </TableCell>
                  <TableCell>
                    ${app.policyValue?.toLocaleString() || '-'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(app.status)}
                  </TableCell>
                  <TableCell>
                    {formatDate(app.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

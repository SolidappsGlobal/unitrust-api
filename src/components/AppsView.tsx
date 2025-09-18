import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { RefreshCw, Search, Database } from 'lucide-react';

interface AppRecord {
  objectId: string;
  appCarrierWritingNumber: string; // Agent ID
  appClient: string; // Client Name
  appUplineUFG_Str: string; // Phone
  appStatusDate: string; // Date of Birth
  appPremiumAmount: number; // Policy Value
  appStatus: string; // Status
  appDate: string; // Created At
}

export default function AppsView() {
  const [apps, setApps] = useState<AppRecord[]>([]);
  const [filteredApps, setFilteredApps] = useState<AppRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    applyFilters();
  }, [apps, searchTerm]);

  // Load data automatically when component mounts
  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Call the new API endpoint
      const query = "SELECT * FROM APP";
      
      
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('https://middlewarepostgressolid-amsqrcep.b4a.run/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: query
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Check if responseData is an array, if not, try to extract the data
      let appData = responseData;
      if (!Array.isArray(responseData)) {
        // If the response has a data property, use it
        if (responseData.data && Array.isArray(responseData.data)) {
          appData = responseData.data;
        } else if (responseData.results && Array.isArray(responseData.results)) {
          appData = responseData.results;
        } else {
          console.log('API Response structure:', responseData);
          throw new Error('API response is not in expected format');
        }
      }
      
      // Check if we have data to process
      if (!appData || appData.length === 0) {
        console.log('No data received from API');
        setApps([]);
        return;
      }

      // Transform data to expected format
      const transformedApps: AppRecord[] = appData.map((record: any, index: number) => ({
        objectId: record.id || record.objectId || `app_${index}`,
        appCarrierWritingNumber: record.appCarrierWritingNumber || '',
        appClient: record.appClient || '',
        appUplineUFG_Str: record.appUplineUFG_Str || '',
        appStatusDate: record.appStatusDate || '',
        appPremiumAmount: record.appPremiumAmount || 0,
        appStatus: record.appStatus || 'Unknown',
        appDate: record.appDate || ''
      }));

      setApps(transformedApps);
    } catch (error) {
      console.error('Error loading data:', error);
      
      // More specific error messages
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setError('Network error: Unable to connect to API. Please check your internet connection.');
      } else if (error instanceof Error && error.name === 'AbortError') {
        setError('Request timeout: API took too long to respond. Please try again.');
      } else if (error instanceof Error) {
        setError(`API Error: ${error.message}`);
      } else {
        setError('Unknown error occurred while loading data.');
      }
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
        app.appCarrierWritingNumber.toLowerCase().includes(term) ||
        app.appClient.toLowerCase().includes(term) ||
        app.appUplineUFG_Str.toLowerCase().includes(term) ||
        app.appStatus.toLowerCase().includes(term)
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
    // Handle different phone formats
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return phone;
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
            Apps (APP Table)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by Agent ID, Client Name, Phone, Status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-10"
                />
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredApps.length} of {apps.length} records
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
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
                    {app.appCarrierWritingNumber}
                  </TableCell>
                  <TableCell>
                    {app.appClient}
                  </TableCell>
                  <TableCell>
                    {formatPhone(app.appUplineUFG_Str)}
                  </TableCell>
                  <TableCell>
                    {formatDate(app.appStatusDate)}
                  </TableCell>
                  <TableCell>
                    ${app.appPremiumAmount?.toLocaleString() || '-'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(app.appStatus)}
                  </TableCell>
                  <TableCell>
                    {formatDate(app.appDate)}
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

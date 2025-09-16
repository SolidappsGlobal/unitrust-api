import React, { useEffect, useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

type StatusFilter = 'to_confirm' | 'has_conflicts' | 'new' | 'confirmed';

interface BackendRecordBase {
  id?: string | number;
  date?: string;
  policyNumber?: string;
}

interface ToConfirmOrConfirmedRecord extends BackendRecordBase {
  received?: Record<string, unknown>;
  found?: Record<string, unknown>;
}

interface HasConflictsRecord extends BackendRecordBase {
  matchesCount?: number;
  client?: string;
  message?: string;
  date?: string;
}

interface NewRecord extends BackendRecordBase {
  agentName?: string;
  client?: string;
  premiumAmount?: number;
  status?: string;
}

type BackendRecord = ToConfirmOrConfirmedRecord | HasConflictsRecord | NewRecord;

interface DataTableProps {
  data: any[][];
  headers: string[];
}

const mockData = {
  to_confirm: [
    {
      id: 1,
      date: "2024-01-15",
      policyNumber: "0106812880",
      agentId: "AG001",
      agentName: "Anthony Ackerman",
      agentStatus: "Inactive",
      dateOfBirth: "1985-03-15",
      phone: "555-0123",
      client: "LOGAN THORNTON",
      premiumAmount: 26.68,
      carrierStatus: "Active",
      status: "Issue-Paid",
      received: {
        date: "2024-01-15",
        policyNumber: "0106812880",
        agentId: "AG001",
        agentName: "Anthony Ackerman",
        agentStatus: "Inactive",
        dateOfBirth: "1985-03-15",
        phone: "555-0123",
        client: "LOGAN THORNTON",
        premiumAmount: 26.68,
        carrierStatus: "Active",
        status: "Issue-Paid"
      },
      found: {
        date: "2024-01-15",
        policyNumber: "0106812880",
        agentId: "AG001",
        agentName: "Anthony Ackerman",
        agentStatus: "Active",
        dateOfBirth: "1985-03-15",
        phone: "555-0123",
        client: "LOGAN THORNTON",
        premiumAmount: 26.68,
        carrierStatus: "Active",
        status: "Confirmed"
      }
    },
    {
      id: 2,
      date: "2024-01-16",
      policyNumber: "0105616060",
      agentId: "AG002",
      agentName: "Nicole Adams",
      agentStatus: "Active",
      dateOfBirth: "1990-07-22",
      phone: "555-0456",
      client: "DORIS SADDLER",
      premiumAmount: 84.51,
      carrierStatus: "Terminated",
      status: "Issue-Paid",
      received: {
        date: "2024-01-16",
        policyNumber: "0105616060",
        agentId: "AG002",
        agentName: "Nicole Adams",
        agentStatus: "Active",
        dateOfBirth: "1990-07-22",
        phone: "555-0456",
        client: "DORIS SADDLER",
        premiumAmount: 84.51,
        carrierStatus: "Terminated",
        status: "Issue-Paid"
      },
      found: {
        date: "2024-01-16",
        policyNumber: "0105616060",
        agentId: "AG002",
        agentName: "Nicole Adams",
        agentStatus: "Active",
        dateOfBirth: "1990-07-22",
        phone: "555-0456",
        client: "DORIS SADDLER",
        premiumAmount: 85.00,
        carrierStatus: "Active",
        status: "Confirmed"
      }
    }
  ],
  has_conflicts: [
    {
      id: 3,
      date: "2024-01-17",
      policyNumber: "0204512990",
      client: "MARCUS RAY",
      message: "Search found 3 results...",
      matchesCount: 3
    },
    {
      id: 4,
      date: "2024-01-18",
      policyNumber: "0204513000",
      client: "SUSAN PRICE",
      message: "Search found 2 results...",
      matchesCount: 2
    }
  ],
  new: [
    {
      id: 5,
      date: "2024-01-19",
      policyNumber: "9999991111",
      agentName: "Sarah Johnson",
      client: "JULIA REED",
      premiumAmount: 45.90,
      status: "New Record"
    },
    {
      id: 6,
      date: "2024-01-20",
      policyNumber: "9999992222",
      agentName: "Michael Brown",
      client: "KEVIN LANE",
      premiumAmount: 120.00,
      status: "New Record"
    },
    {
      id: 7,
      date: "2024-01-21",
      policyNumber: "9999993333",
      agentName: "Emily Davis",
      client: "LISA WILSON",
      premiumAmount: 78.50,
      status: "New Record"
    }
  ],
  confirmed: [
    {
      id: 7,
      policyNumber: "0106812777",
      agentName: "Thomas King",
      client: "PETER WELLS",
      premiumAmount: 99.99,
      carrierStatus: "Active",
      status: "Confirmed"
    },
    {
      id: 8,
      policyNumber: "0105616777",
      agentName: "Robert Smith",
      client: "LAURA TAYLOR",
      premiumAmount: 150.25,
      carrierStatus: "Active",
      status: "Confirmed"
    }
  ]
};

export function DataTable({ data, headers }: DataTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('to_confirm');
  const [records, setRecords] = useState<BackendRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<Array<string | number>>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedConflict, setSelectedConflict] = useState<HasConflictsRecord | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedNewRecord, setSelectedNewRecord] = useState<NewRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedRecords([]);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!cancelled) {
          const data = mockData[statusFilter] || [];
          setRecords(data as BackendRecord[]);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [statusFilter]);

  const isUsingBackend = records.length > 0 || isLoading || error !== null;

  const handleResolveConflicts = (record: HasConflictsRecord) => {
    setSelectedConflict(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedConflict(null);
    setSelectedOption(null);
  };

  const handleConfirmChanges = () => {
    if (selectedOption) {
      setIsConfirmModalOpen(true);
    }
  };

  const handleFinalConfirm = () => {
    console.log('Final confirmation for option:', selectedOption);
    // TODO: Implement actual confirmation logic
    setIsConfirmModalOpen(false);
    setIsModalOpen(false);
    setSelectedConflict(null);
    setSelectedOption(null);
  };

  const handleCancelConfirm = () => {
    setIsConfirmModalOpen(false);
  };

  const handleCreateRecord = (record: NewRecord) => {
    setSelectedNewRecord(record);
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreate = () => {
    if (selectedNewRecord) {
      console.log('Creating record:', selectedNewRecord);
      // TODO: Implement actual creation logic
      setIsCreateModalOpen(false);
      setSelectedNewRecord(null);
    }
  };

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false);
    setSelectedNewRecord(null);
  };

  // Mock data for found matches in the modal
  const getMockFoundMatches = (record: HasConflictsRecord) => {
    const matchesCount = record.matchesCount || 0;
    return Array.from({ length: matchesCount }, (_, index) => ({
      id: `${record.id}-match-${index + 1}`,
      policyNumber: `${record.policyNumber}-${index + 1}`,
      agentId: `AG${String(index + 1).padStart(3, '0')}`,
      agentName: `Agent ${index + 1}`,
      agentStatus: index === 0 ? 'Active' : 'Inactive',
      dateOfBirth: `198${index + 5}-0${index + 1}-1${index + 5}`,
      phone: `555-0${index + 1}${index + 2}${index + 3}`,
      client: `${record.client} (Match ${index + 1})`,
      premiumAmount: 100 + (index * 50),
      status: index === 0 ? 'Confirmed' : 'Pending',
      score: Math.floor(85 + (index * 5)),
      date: record.date || '2024-01-01'
    }));
  };

  // Mock received data for comparison
  const getMockReceivedData = (record: HasConflictsRecord) => ({
    policyNumber: record.policyNumber || '',
    agentId: 'AG001',
    agentName: 'John Doe',
    agentStatus: 'Active',
    dateOfBirth: '1985-03-15',
    phone: '555-0123',
    client: record.client || '',
    premiumAmount: 150.00,
    status: 'Issue-Paid',
    date: record.date || ''
  });

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl">Records</h2>
          <div className="flex items-center gap-3 w-full">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[220px] border-[#666666]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="to_confirm">To Confirm</SelectItem>
                <SelectItem value="has_conflicts">Has Conflicts</SelectItem>
                <SelectItem value="new">New (not found)</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
            {statusFilter === 'to_confirm' && (
              <>
                <Button
                  className="ml-1"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('Clear Data clicked');
                  }}
                >
                  Clear Data
                </Button>
              <Button
                className="ml-1 text-white disabled:bg-gray-300 disabled:text-gray-500"
                style={{ backgroundColor: '#006CB6' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1A325C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#006CB6';
                }}
                variant="default"
                size="sm"
                disabled={selectedRecords.length === 0 || isLoading}
                onClick={async () => {
                  try {
                    const res = await fetch('/records/confirm', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ids: selectedRecords }),
                    });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const confirmedIds = new Set(selectedRecords);
                    setRecords((prev) => prev.filter((r) => !confirmedIds.has((r as BackendRecordBase).id as string | number)));
                    setSelectedRecords([]);
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Confirm Changes
              </Button>
              </>
            )}
            <div className="ml-auto text-sm" style={{ color: '#666666' }}>
              {isUsingBackend ? `${records.length} total found` : `${data.length} record${data.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        {isUsingBackend ? (
          <div className="rounded-md border overflow-hidden">
            {isLoading ? (
              <div className="p-6 text-sm" style={{ color: '#666666' }}>Loading...</div>
            ) : error ? (
              <div className="p-6 text-sm text-red-600">{error}</div>
            ) : statusFilter === 'has_conflicts' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[160px]">Policy Number</TableHead>
                    <TableHead className="min-w-[200px]">Client</TableHead>
                    <TableHead className="min-w-[260px]">Message</TableHead>
                    <TableHead className="min-w-[180px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r, idx) => (
                    <TableRow key={(r as any).id ?? idx}>
                      <TableCell>{(r as any).policyNumber ?? '-'}</TableCell>
                      <TableCell>{(r as any).client ?? '-'}</TableCell>
                      <TableCell>{(r as any).message ?? 'Search found 0 results...'}</TableCell>
                      <TableCell>
                        <button 
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 ease-in-out border h-9 px-3 cursor-pointer"
                          style={{
                            transition: 'all 0.2s ease-in-out',
                            borderColor: '#666666',
                            backgroundColor: '#F4F4F4',
                            color: '#666666'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#006CB6';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = '#006CB6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#F4F4F4';
                            e.currentTarget.style.color = '#666666';
                            e.currentTarget.style.borderColor = '#666666';
                          }}
                          onClick={() => handleResolveConflicts(r as HasConflictsRecord)}
                        >
                          Resolve Conflicts
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : statusFilter === 'new' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Date</TableHead>
                    <TableHead className="min-w-[160px]">Policy Number</TableHead>
                    <TableHead className="min-w-[180px]">Agent Name</TableHead>
                    <TableHead className="min-w-[200px]">Client</TableHead>
                    <TableHead className="min-w-[140px]">Premium Amount</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r, idx) => {
                    const newRecord = r as NewRecord;
                    return (
                      <TableRow key={newRecord.id ?? idx}>
                        <TableCell>{newRecord.date ?? '-'}</TableCell>
                        <TableCell className="font-medium">{newRecord.policyNumber ?? '-'}</TableCell>
                        <TableCell>{newRecord.agentName ?? '-'}</TableCell>
                        <TableCell>{newRecord.client ?? '-'}</TableCell>
                        <TableCell className="font-medium">${newRecord.premiumAmount?.toFixed(2) ?? '-'}</TableCell>
                        <TableCell>
                          <span 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: '#F4F4F4', 
                              color: '#1A325C' 
                            }}
                          >
                            {newRecord.status ?? 'New Record'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="default" 
                            size="sm"
                            className="text-white"
                            style={{ backgroundColor: '#006CB6' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#1A325C';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#006CB6';
                            }}
                            onClick={() => handleCreateRecord(newRecord)}
                          >
                            Create
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    {statusFilter === 'to_confirm' && (
                      <TableHead className="w-[3%]"></TableHead>
                    )}
                    <TableHead className="w-[8%]">Date</TableHead>
                    <TableHead className="w-[12%]">Policy Number</TableHead>
                    <TableHead className="w-[8%]">Agent ID</TableHead>
                    <TableHead className="w-[12%]">Agent Name</TableHead>
                    <TableHead className="w-[10%]">Agent Status</TableHead>
                    <TableHead className="w-[10%]">Date of Birth</TableHead>
                    <TableHead className="w-[10%]">Phone</TableHead>
                    <TableHead className="w-[12%]">Client</TableHead>
                    <TableHead className="w-[10%]">Premium Amount</TableHead>
                    <TableHead className="w-[10%]">Carrier Status</TableHead>
                    <TableHead className="w-[8%]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r, idx) => {
                    const id = (r as any).id ?? idx;
                    const checked = selectedRecords.includes(id);
                    const received = (r as any).received || {};
                    const found = (r as any).found || {};
                    
                    const renderComparison = (field: string, receivedValue: any, foundValue: any) => {
                      const isDifferent = receivedValue !== foundValue;
                      const hasFound = foundValue !== undefined && foundValue !== null && foundValue !== '';
                      
                    return (
                        <div className="space-y-2">
                          <div className={`text-xs ${isDifferent ? 'text-red-600' : 'text-gray-600'}`}>
                            Received: {receivedValue || '-'}
                          </div>
                          <div className={`text-xs ${hasFound ? 'text-green-600' : 'text-red-600'}`}>
                            Found: {hasFound ? foundValue : 'Not Found'}
                          </div>
                        </div>
                      );
                    };
                    
                    return (
                      <TableRow key={id}>
                        {statusFilter === 'to_confirm' && (
                          <TableCell>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                const next = Boolean(v);
                                setSelectedRecords((prev) => {
                                  const pid = id as string | number;
                                  if (next) return prev.includes(pid) ? prev : [...prev, pid];
                                  return prev.filter((x) => x !== pid);
                                });
                              }}
                              aria-label="Select row"
                            />
                          </TableCell>
                        )}
                        <TableCell>{renderComparison('date', received.date, found.date)}</TableCell>
                        <TableCell>{renderComparison('policyNumber', received.policyNumber, found.policyNumber)}</TableCell>
                        <TableCell>{renderComparison('agentId', received.agentId, found.agentId)}</TableCell>
                        <TableCell>{renderComparison('agentName', received.agentName, found.agentName)}</TableCell>
                        <TableCell>{renderComparison('agentStatus', received.agentStatus, found.agentStatus)}</TableCell>
                        <TableCell>{renderComparison('dateOfBirth', received.dateOfBirth, found.dateOfBirth)}</TableCell>
                        <TableCell>{renderComparison('phone', received.phone, found.phone)}</TableCell>
                        <TableCell>{renderComparison('client', received.client, found.client)}</TableCell>
                        <TableCell>{renderComparison('premiumAmount', received.premiumAmount, found.premiumAmount)}</TableCell>
                        <TableCell>{renderComparison('carrierStatus', received.carrierStatus, found.carrierStatus)}</TableCell>
                        <TableCell>{renderComparison('status', received.status, found.status)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            {data.length === 0 ? (
              <div className="p-8">
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg text-gray-600 mb-2">No Data Available</h3>
                  <p className="text-gray-500">Upload a CSV file to view records here</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header, index) => (
                      <TableHead key={index} className="min-w-[100px]">{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex} className="max-w-xs truncate">{cell || '-'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </div>

      {/* Resolve Conflicts Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className="max-h-[80vh] overflow-y-auto"
          style={{ minWidth: '900px', maxWidth: '1200px' }}
        >
          <DialogHeader className="space-y-8">
            <div className="flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold" style={{ color: '#1A325C' }}>Select an option</DialogTitle>
                {selectedConflict && (
                  <p className="text-sm mt-1" style={{ color: '#666666' }}>
                    {getMockFoundMatches(selectedConflict).length} total found
                  </p>
                )}
              </div>
              <Button 
                variant="default" 
                size="sm"
                className="text-white disabled:bg-gray-300 disabled:text-gray-500 mr-6"
                style={{ backgroundColor: '#006CB6' }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#1A325C';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#006CB6';
                  }
                }}
                disabled={!selectedOption}
                onClick={handleConfirmChanges}
              >
                Confirm Changes
              </Button>
            </div>
          </DialogHeader>
          
          {selectedConflict && (
            <div className="space-y-4">
              {/* Comparison Table */}
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                      <TableHead className="w-32 font-semibold">Labels</TableHead>
                      <TableHead className="min-w-[120px]">Policy Number</TableHead>
                      <TableHead className="min-w-[100px]">Agent ID</TableHead>
                      <TableHead className="min-w-[140px]">Agent Name</TableHead>
                      <TableHead className="min-w-[120px]">Agent Status</TableHead>
                      <TableHead className="min-w-[120px]">Date of Birth</TableHead>
                      <TableHead className="min-w-[100px]">Phone</TableHead>
                      <TableHead className="min-w-[140px]">Client</TableHead>
                      <TableHead className="min-w-[120px]">Premium Amount</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[80px]">Score</TableHead>
                      <TableHead className="min-w-[60px]">Select</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {/* Received Data Row */}
                    <TableRow style={{ backgroundColor: '#F4F4F4' }}>
                      <TableCell className="font-medium" style={{ color: '#1A325C' }}>Received</TableCell>
                      {(() => {
                        const received = getMockReceivedData(selectedConflict);
                    return (
                          <>
                            <TableCell className="font-medium">{received.policyNumber}</TableCell>
                            <TableCell className="font-medium">{received.agentId}</TableCell>
                            <TableCell className="font-medium">{received.agentName}</TableCell>
                            <TableCell className="font-medium">{received.agentStatus}</TableCell>
                            <TableCell className="font-medium">{received.dateOfBirth}</TableCell>
                            <TableCell className="font-medium">{received.phone}</TableCell>
                            <TableCell className="font-medium">{received.client}</TableCell>
                            <TableCell className="font-medium">${received.premiumAmount}</TableCell>
                            <TableCell className="font-medium">{received.status}</TableCell>
                            <TableCell className="font-medium">-</TableCell>
                            <TableCell className="font-medium">-</TableCell>
                          </>
                        );
                      })()}
                  </TableRow>

                    {/* Found Options Rows */}
                    {getMockFoundMatches(selectedConflict).map((match, index) => {
                      const received = getMockReceivedData(selectedConflict);
                      const isSelected = selectedOption === match.id;
                      
                      const compareValues = (receivedVal: any, foundVal: any) => {
                        const isMatch = receivedVal === foundVal;
                        return {
                          received: receivedVal,
                          found: foundVal,
                          isMatch
                        };
                      };

                    return (
                        <TableRow 
                          key={match.id}
                          className={`hover:bg-gray-50 transition-colors ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                        >
                          <TableCell className="font-medium text-gray-700">
                            Option {index + 1}
                          </TableCell>
                          {(() => {
                            const policy = compareValues(received.policyNumber, match.policyNumber);
                            return (
                              <>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className={`text-xs ${policy.isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {policy.received}
                                    </div>
                                    <div className={`text-xs ${policy.isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {policy.found}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className={`text-xs ${compareValues(received.agentId, match.agentId).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {received.agentId}
                                    </div>
                                    <div className={`text-xs ${compareValues(received.agentId, match.agentId).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {match.agentId}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className={`text-xs ${compareValues(received.agentName, match.agentName).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {received.agentName}
                                    </div>
                                    <div className={`text-xs ${compareValues(received.agentName, match.agentName).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {match.agentName}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className={`text-xs ${compareValues(received.agentStatus, match.agentStatus).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {received.agentStatus}
                                    </div>
                                    <div className={`text-xs ${compareValues(received.agentStatus, match.agentStatus).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {match.agentStatus}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className={`text-xs ${compareValues(received.dateOfBirth, match.dateOfBirth).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {received.dateOfBirth}
                                    </div>
                                    <div className={`text-xs ${compareValues(received.dateOfBirth, match.dateOfBirth).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {match.dateOfBirth}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className={`text-xs ${compareValues(received.phone, match.phone).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {received.phone}
                                    </div>
                                    <div className={`text-xs ${compareValues(received.phone, match.phone).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {match.phone}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className={`text-xs ${compareValues(received.client, match.client).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {received.client}
                                    </div>
                                    <div className={`text-xs ${compareValues(received.client, match.client).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {match.client}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className={`text-xs ${compareValues(received.premiumAmount, match.premiumAmount).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      ${received.premiumAmount}
                                    </div>
                                    <div className={`text-xs ${compareValues(received.premiumAmount, match.premiumAmount).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      ${match.premiumAmount}
                                    </div>
                                  </div>
                                </TableCell>
                          <TableCell>
                                  <div className="space-y-1">
                                    <div className={`text-xs ${compareValues(received.status, match.status).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {received.status}
                                    </div>
                                    <div className={`text-xs ${compareValues(received.status, match.status).isMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {match.status}
                                    </div>
                                  </div>
                          </TableCell>
                        <TableCell>
                                  <div className="flex justify-center">
                                    <div 
                                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                      style={{
                                        backgroundColor: match.score >= 90 ? 'rgba(34, 197, 94, 0.75)' : 
                                                       match.score >= 70 ? 'rgba(234, 179, 8, 0.75)' : 'rgba(248, 113, 113, 0.75)',
                                        color: 'white'
                                      }}
                                    >
                                      {match.score}
                                    </div>
                                  </div>
                        </TableCell>
                        <TableCell>
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => setSelectedOption(isSelected ? null : match.id)}
                                      aria-label={`Select option ${index + 1}`}
                                      style={{ 
                                        accentColor: '#006CB6' 
                                      }}
                                    />
                                  </div>
                        </TableCell>
                              </>
                            );
                          })()}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
                </div>
              </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseModal}
              style={{ 
                backgroundColor: '#F4F4F4', 
                color: '#666666',
                borderColor: '#666666'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E0E0E0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F4F4F4';
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold" style={{ color: '#1A325C' }}>Confirm Changes</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm" style={{ color: '#666666' }}>
              Are you sure you want to confirm the selected option? This action cannot be undone.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelConfirm}
              style={{ 
                backgroundColor: '#F4F4F4', 
                color: '#666666',
                borderColor: '#666666'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E0E0E0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F4F4F4';
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleFinalConfirm}
              className="text-white"
              style={{ backgroundColor: '#006CB6' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1A325C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#006CB6';
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Record Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold" style={{ color: '#1A325C' }}>Create New Record</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm mb-4" style={{ color: '#666666' }}>
              Are you sure you want to create this new record? This action will add the record to the system.
            </p>
            {selectedNewRecord && (
              <div className="p-4 rounded-lg space-y-2" style={{ backgroundColor: '#F4F4F4' }}>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium" style={{ color: '#1A325C' }}>Policy Number:</span>
                    <span className="ml-2" style={{ color: '#666666' }}>{selectedNewRecord.policyNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: '#1A325C' }}>Client:</span>
                    <span className="ml-2" style={{ color: '#666666' }}>{selectedNewRecord.client}</span>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: '#1A325C' }}>Agent:</span>
                    <span className="ml-2" style={{ color: '#666666' }}>{selectedNewRecord.agentName}</span>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: '#1A325C' }}>Premium:</span>
                    <span className="ml-2" style={{ color: '#666666' }}>${selectedNewRecord.premiumAmount?.toFixed(2)}</span>
                </div>
              </div>
          </div>
        )}
      </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelCreate}
              style={{ 
                backgroundColor: '#F4F4F4', 
                color: '#666666',
                borderColor: '#666666'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E0E0E0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F4F4F4';
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleConfirmCreate}
              className="text-white"
              style={{ backgroundColor: '#006CB6' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1A325C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#006CB6';
              }}
            >
              Create Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

import React, { useRef, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, FileText } from 'lucide-react';
import Papa from 'papaparse';

interface UploadTabProps {
  onCsvUpload: (data: any[], headers: string[]) => void;
}

export function UploadTab({ onCsvUpload }: UploadTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [company, setCompany] = useState('');
  const [documentType, setDocumentType] = useState('');

  const handleFileSelect = (file: File) => {
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert('Please select a CSV file first');
      return;
    }

    Papa.parse(selectedFile, {
      complete: (results) => {
        const data = results.data as string[][];
        if (data.length > 0) {
          const headers = data[0];
          const rows = data.slice(1).filter(row => row.some(cell => cell.trim() !== ''));
          onCsvUpload(rows, headers);
        }
      },
      header: false,
      skipEmptyLines: true,
    });
  };

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl text-blue-600">Carrier Data Extractor</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded">
            <FileText size={16} />
            <span>CSV</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger className="bg-gray-100">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="company1">Company 1</SelectItem>
              <SelectItem value="company2">Company 2</SelectItem>
              <SelectItem value="company3">Company 3</SelectItem>
            </SelectContent>
          </Select>

          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger className="bg-gray-100">
              <SelectValue placeholder="Choose document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="report">Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-blue-500 cursor-pointer">
            Click to upload CSV file or drag and drop
          </p>
          {selectedFile && (
            <p className="mt-2 text-sm text-green-600">
              Selected: {selectedFile.name}
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile}
            className="px-6"
          >
            Upload File
          </Button>
        </div>
      </div>
    </Card>
  );
}
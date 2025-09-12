import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Upload, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    }
  };

  const isFormValid = selectedCompany && selectedDocumentType;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="mb-8 flex justify-center">
            <TabsTrigger 
              value="upload" 
              className="px-8 py-3 bg-blue-500 text-white data-[state=active]:bg-blue-600"
            >
              Upload (CSV)
            </TabsTrigger>
            <TabsTrigger 
              value="list" 
              className="px-8 py-3 bg-blue-300 text-white data-[state=active]:bg-blue-400"
            >
              List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-blue-700 text-2xl font-bold">
                  Carrier Data Extractor
                </CardTitle>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center p-3">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="w-full">
                  <div className="flex gap-4 w-full">
                    <div className="flex-1">
                      <Select onValueChange={setSelectedCompany}>
                        <SelectTrigger className="h-12 w-full">
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company1">Company A</SelectItem>
                          <SelectItem value="company2">Company B</SelectItem>
                          <SelectItem value="company3">Company C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      <Select onValueChange={setSelectedDocumentType}>
                        <SelectTrigger className="h-12 w-full">
                          <SelectValue placeholder="Choose document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="receipt">Receipt</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div 
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isFormValid 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  {isFormValid ? (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer text-blue-600 hover:text-blue-700"
                        >
                          {file ? `Selected: ${file.name}` : 'Click to upload CSV file or drag and drop'}
                        </label>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      First, select company and document type.
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button 
                    disabled={!isFormValid || !file}
                    className="px-6 py-2 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload file
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">Lista de arquivos enviados aparecerá aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
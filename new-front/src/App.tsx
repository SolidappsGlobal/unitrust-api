import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { AuthenticationScreen } from "./components/AuthenticationScreen";
import { UserMenu } from "./components/UserMenu";
import { UploadTab } from "./components/UploadTab";
import { DataTable } from "./components/DataTable";
import { Upload, FileText } from "lucide-react";

interface User {
  email: string;
  name: string;
}

export default function App() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [activeView, setActiveView] = useState("upload");
  const [user, setUser] = useState<User | null>(null);
  const [showChangePassword, setShowChangePassword] =
    useState(false);

  const handleAuthenticated = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCsvData([]);
    setHeaders([]);
    setActiveView("upload");
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  const handleCsvUpload = (data: any[], headers: string[]) => {
    setCsvData(data);
    setHeaders(headers);
    setActiveView("list");
  };

  // Show authentication screen if user is not logged in or wants to change password
  if (!user || showChangePassword) {
    return (
      <AuthenticationScreen
        onAuthenticated={(authenticatedUser) => {
          setUser(authenticatedUser);
          setShowChangePassword(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Page Title, Navigation, and User Menu */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl text-gray-900">
              Unitrust CSV Data Manager
            </h1>

            {/* Navigation Tabs */}
            <Tabs
              value={activeView}
              onValueChange={setActiveView}
              className="w-auto"
            >
              <TabsList className="bg-white border border-gray-200 shadow-sm p-1">
                <TabsTrigger
                  value="upload"
                  className="px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  List
                  {csvData.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                      {csvData.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* User Menu */}
          <UserMenu
            user={user}
            onLogout={handleLogout}
            onChangePassword={handleChangePassword}
          />
        </div>

        {/* Content Area */}
        <Tabs
          value={activeView}
          onValueChange={setActiveView}
          className="w-full"
        >
          <TabsContent
            value="upload"
            className="space-y-4 mt-0"
          >
            <UploadTab onCsvUpload={handleCsvUpload} />
          </TabsContent>

          <TabsContent value="list" className="space-y-4 mt-0">
            <DataTable data={csvData} headers={headers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
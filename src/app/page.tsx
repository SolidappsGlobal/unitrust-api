"use client"

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { UserMenu } from "@/components/UserMenu";
import { UploadTab } from "@/components/UploadTab";
import CSVUploadProcessor from "@/components/CSVUploadProcessor";
import AppMatchingList from "@/components/AppMatchingList";
import AppsView from "@/components/AppsView";
import { Upload, FileText, Database } from "lucide-react";

interface User {
  email: string;
  name: string;
}

export default function Home() {
  const [activeView, setActiveView] = useState("upload");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  // Mock user for demonstration
  const user: User = { email: "admin@test.com", name: "Admin User" };

  const handleCsvUpload = (data: any[], headers: string[]) => {
    setCsvData(data);
    setHeaders(headers);
    setActiveView("list");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-[1920px] mx-auto">
        {/* Header with Page Title, Navigation, and User Menu */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl text-gray-900">
              Unitrust Data Manager
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
                  className="px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[state=active]:[&_svg]:text-white"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[state=active]:[&_svg]:text-white"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger
                  value="apps"
                  className="px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[state=active]:[&_svg]:text-white"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Apps
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* User Info */}
          <UserMenu user={user} />
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
            <AppMatchingList />
          </TabsContent>

          <TabsContent value="apps" className="space-y-4 mt-0">
            <AppsView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
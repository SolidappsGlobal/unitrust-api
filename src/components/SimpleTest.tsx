import React from 'react';

export default function SimpleTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        🎉 POC Reliability Score & Matching
      </h1>
      <div className="bg-green-100 p-4 rounded-lg">
        <p className="text-green-800">
          ✅ Aplicação carregando corretamente!
        </p>
      </div>
      <div className="mt-4 space-y-2">
        <p>📊 <strong>Funcionalidades disponíveis:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Database Manager - Criar e gerenciar tabelas</li>
          <li>CSV Processor - Upload e processamento de CSVs</li>
          <li>Sistema de Scoring - Algoritmo de matching</li>
        </ul>
      </div>
    </div>
  );
}

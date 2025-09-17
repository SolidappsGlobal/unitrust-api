// Reliability Score & Matching Algorithm
// Based on business rules from the document

export interface MatchingData {
  policyNumber?: string;
  phone?: string;
  dateOfBirth?: Date | string;
  firstName?: string;
  lastName?: string;
  policyValue?: number;
  agentNumber?: string;
  carrier?: string;
}

export interface ScoreBreakdown {
  policyNumber: number;
  phone: number;
  dateOfBirth: number;
  name: number;
  policyValue: number;
  agentNumber: number;
  total: number;
}

export interface MatchingResult {
  score: number;
  classification: 'auto_confirm' | 'manual_review' | 'new_record';
  matchingFields: string[];
  scoreBreakdown: ScoreBreakdown;
}

// Function to normalize strings for comparison
function normalizeString(str: string | undefined): string {
  if (!str) return '';
  return str.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

// Function to normalize phone numbers
function normalizePhone(phone: string | undefined): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

// Function to normalize dates
function normalizeDate(date: Date | string | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Function to calculate matching score
export function calculateMatchingScore(
  csvData: MatchingData,
  appData: MatchingData
): MatchingResult {
  const scoreBreakdown: ScoreBreakdown = {
    policyNumber: 0,
    phone: 0,
    dateOfBirth: 0,
    name: 0,
    policyValue: 0,
    agentNumber: 0,
    total: 0
  };

  const matchingFields: string[] = [];

  // Main fields (max. 80 points)
  
  // 1. PolicyNumber (+20 points)
  if (csvData.policyNumber && appData.policyNumber) {
    const csvPolicy = normalizeString(csvData.policyNumber);
    const appPolicy = normalizeString(appData.policyNumber);
    if (csvPolicy === appPolicy) {
      scoreBreakdown.policyNumber = 20;
      matchingFields.push('policyNumber');
    }
  }

  // 2. Phone (+20 points)
  if (csvData.phone && appData.phone) {
    const csvPhone = normalizePhone(csvData.phone);
    const appPhone = normalizePhone(appData.phone);
    if (csvPhone === appPhone && csvPhone.length > 0) {
      scoreBreakdown.phone = 20;
      matchingFields.push('phone');
    }
  }

  // 3. Date of Birth (+20 points)
  if (csvData.dateOfBirth && appData.dateOfBirth) {
    const csvDOB = normalizeDate(csvData.dateOfBirth);
    const appDOB = normalizeDate(appData.dateOfBirth);
    if (csvDOB === appDOB && csvDOB.length > 0) {
      scoreBreakdown.dateOfBirth = 20;
      matchingFields.push('dateOfBirth');
    }
  }

  // 4. Name (FirstName + LastName) (+20 points)
  if (csvData.firstName && csvData.lastName && appData.firstName && appData.lastName) {
    const csvFullName = normalizeString(csvData.firstName + ' ' + csvData.lastName);
    const appFullName = normalizeString(appData.firstName + ' ' + appData.lastName);
    if (csvFullName === appFullName) {
      scoreBreakdown.name = 20;
      matchingFields.push('name');
    }
  }

  // Conditional fields (only if any of the main ones match)
  const hasMainFieldMatch = matchingFields.length > 0;
  
  if (hasMainFieldMatch) {
    // 5. Policy Value (+20 points)
    if (csvData.policyValue && appData.policyValue) {
      const csvValue = Number(csvData.policyValue);
      const appValue = Number(appData.policyValue);
      if (!isNaN(csvValue) && !isNaN(appValue) && csvValue === appValue) {
        scoreBreakdown.policyValue = 20;
        matchingFields.push('policyValue');
      }
    }

    // 6. Agent Number (+20 points)
    if (csvData.agentNumber && appData.agentNumber) {
      const csvAgent = normalizeString(csvData.agentNumber);
      const appAgent = normalizeString(appData.agentNumber);
      if (csvAgent === appAgent) {
        scoreBreakdown.agentNumber = 20;
        matchingFields.push('agentNumber');
      }
    }
  }

  // Calculate total
  scoreBreakdown.total = Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0);

  // Check mandatory fields for auto-confirmation
  const hasMandatoryFields = scoreBreakdown.policyNumber > 0 && scoreBreakdown.agentNumber > 0;

  // Classification based on business rules:
  // 1. Policy + Agent found → Auto Confirm
  // 2. ≥ 60% (no tie) → Auto Confirm  
  // 3. Tie on score → Manual Review
  // 4. < 60% → Manual Review or New Record
  let classification: 'auto_confirm' | 'manual_review' | 'new_record';
  
  if (hasMandatoryFields) {
    // Policy + Agent found → Auto Confirm
    classification = 'auto_confirm';
  } else if (scoreBreakdown.total >= 60) {
    // ≥ 60% → Auto Confirm
    classification = 'auto_confirm';
  } else if (scoreBreakdown.total >= 40) {
    // 40-59% → Manual Review
    classification = 'manual_review';
  } else {
    // < 40% → New Record
    classification = 'new_record';
  }

  return {
    score: scoreBreakdown.total,
    classification,
    matchingFields,
    scoreBreakdown
  };
}

// Function to process a CSV and match with APPs
export async function processCSVMatching(
  csvData: MatchingData[],
  csvUploadId: string
): Promise<any[]> {
  const results: any[] = [];

  // Fetch all APPs for comparison
  const { queryData } = await import('./database');
  const apps = await queryData('app_tests');
  
  for (let i = 0; i < csvData.length; i++) {
    const csvRecord = csvData[i];
    const csvRecordId = `csv_${i}`;
    
    let bestMatch: MatchingResult | null = null;
    let bestApp: any = null;

    // Compare with all APPs
    for (const app of apps) {
      // Map real fields from app_tests table
      const appData: MatchingData = {
        policyNumber: app.get('policyNumber'),
        phone: app.get('phone'),
        dateOfBirth: app.get('dateOfBirth'),
        firstName: app.get('firstName'),
        lastName: app.get('lastName'),
        policyValue: app.get('policyValue'),
        agentNumber: app.get('agentNumber'),
        carrier: app.get('Carrier')
      };

      const matchResult = calculateMatchingScore(csvRecord, appData);
      
      // Keep the best match
      if (!bestMatch || matchResult.score > bestMatch.score) {
        bestMatch = matchResult;
        bestApp = app;
      }
    }

    // Create matching result
    const matchingResult = {
      csvUploadId,
      csvRecordId,
      appId: bestApp ? bestApp.id : null,
      
      // CSV data
      csvPolicyNumber: csvRecord.policyNumber,
      csvPhone: csvRecord.phone,
      csvDateOfBirth: csvRecord.dateOfBirth,
      csvFirstName: csvRecord.firstName,
      csvLastName: csvRecord.lastName,
      csvPolicyValue: csvRecord.policyValue,
      csvAgentNumber: csvRecord.agentNumber,
      
      // APP data (if found)
      appPolicyNumber: bestApp ? bestApp.get('policyNumber') : null,
      appPhone: bestApp ? bestApp.get('phone') : null,
      appDateOfBirth: bestApp ? bestApp.get('dateOfBirth') : null,
      appFirstName: bestApp ? bestApp.get('firstName') : null,
      appLastName: bestApp ? bestApp.get('lastName') : null,
      appPolicyValue: bestApp ? bestApp.get('policyValue') : null,
      appAgentNumber: bestApp ? bestApp.get('agentNumber') : null,
      
      // Matching result
      score: bestMatch ? bestMatch.score : 0,
      classification: bestMatch ? bestMatch.classification : 'new_record',
      confirmed: false,
      
      // Scoring details
      matchingFields: bestMatch ? bestMatch.matchingFields : [],
      scoreBreakdown: bestMatch ? bestMatch.scoreBreakdown : {
        policyNumber: 0,
        phone: 0,
        dateOfBirth: 0,
        name: 0,
        policyValue: 0,
        agentNumber: 0,
        total: 0
      },
      
      createdAt: new Date()
    };

    results.push(matchingResult);
  }

  return results;
}

// Function to insert sample data into APP table
export async function insertSampleAPPs(): Promise<void> {
  const { insertData } = await import('./database');
  const sampleAPPs = [
    {
      policyNumber: '109876700',
      phone: '763-291-3316',
      dateOfBirth: new Date('1985-01-25'),
      firstName: 'ANTHONY',
      lastName: 'BLOOD',
      policyValue: 250000,
      agentNumber: '1130763',
      writingAgent: '1130763',
      agentName: 'AASEN/ HANNAH',
      company: '110',
      status: 'Declined',
      appDate: new Date('2025-05-08'),
      policyDate: new Date('2025-05-14'),
      paidToDate: new Date('2025-05-14'),
      recvDate: new Date('2025-05-14'),
      mi: 'L',
      plan: 'HCR7430N',
      face: 250000,
      form: 'Bank Draft',
      mode: 'monthly',
      modePrem: 231.93,
      address1: '36061 BAUGH ST NW',
      address2: 'PRINCETON MN 55371',
      state: 'MN',
      zip: '55371',
      email: 'TONYBLOOD.TB@GMAIL.COM',
      wrtPct: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      policyNumber: '106165110',
      phone: '478-251-5414',
      dateOfBirth: new Date('1961-11-18'),
      firstName: 'SHERRI',
      lastName: 'ARP',
      policyValue: 100000,
      agentNumber: '1068187',
      writingAgent: '1068187',
      agentName: 'ABDULRABB/ JAMAIYAH J',
      company: '110',
      status: 'Declined',
      appDate: new Date('2023-09-21'),
      policyDate: new Date('2023-09-22'),
      paidToDate: new Date('2023-09-22'),
      recvDate: new Date('2023-09-24'),
      mi: 'M',
      plan: 'TM415N',
      face: 100000,
      form: 'Bank Draft',
      mode: 'monthly',
      modePrem: 75.33,
      address1: '410 KINGS RD SE',
      address2: 'ROME GA 30161',
      state: 'GA',
      zip: '30161',
      email: 'ARPSHERRI18@GMAIL.COM',
      wrtPct: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const appData of sampleAPPs) {
    try {
      await insertData('APP', appData);
      console.log(`✅ APP inserted: ${appData.policyNumber}`);
    } catch (error) {
      console.error(`❌ Error inserting APP ${appData.policyNumber}:`, error);
    }
  }
}

export default {
  calculateMatchingScore,
  processCSVMatching,
  insertSampleAPPs
};

import { test, expect } from '@playwright/test';
import * as fs from 'fs'; // Untuk membaca file JSON
import * as path from 'path'; // Untuk menangani path dengan aman

// Fungsi untuk membaca data dari file JSON
function readJsonData(filePath: string) {
  const fullPath = path.join(__dirname, filePath);  // Menyusun path absolut ke file data.json
  const data = fs.readFileSync(fullPath, 'utf8');  // Membaca file JSON
  return JSON.parse(data);  // Mengonversi data JSON menjadi objek JavaScript
}

// Fungsi untuk melakukan permintaan API dengan data yang berbeda
async function sendApiRequest(payload: any, timeout: number = 60000) {
  const url = 'https://api-automation-dev.ifg-life.id/v2/ao-fraud/workflow/fraud-checking';
  const headers = {
    'apiKey': 'E97baCBt8SxmDcYNyd3KwbEA0giw8ElF',
    'Content-Type': 'application/json'
  };

  // Pastikan claimType dikirim dalam format yang benar di dalam config.isClaim
  const body = {
    "config": {
      "sourceRequest": payload.sourceRequest,
      "isClaim": {
        "isClaim": true,
        "claimType": payload.claimType || "LF"  // Default ke "LF" jika claimType tidak ada
      },
      "screeningApuppt": payload.screeningApuppt
    },
    "screeningAPUPPT": {
      "name": payload.name,
      "idNumber": payload.idNumber,
      "idType": payload.idType,
      "dob": payload.dob
    },
    "claimInfo": {
      "claimId": payload.claimId,
      "claimNumber": payload.claimNumber,
      "doctorName": payload.doctorName,
      "beneficiaryName": payload.beneficiaryName,
      "relation": payload.relation,
      "hospitalName": payload.hospitalName,
      "claimAmount": payload.claimAmount,
      "bankName": payload.bankName,
      "bankAccountName": payload.bankAccountName,
      "bankAccountNumber": payload.bankAccountNumber,
      "hospitalArea": payload.hospitalArea,
      "policyHolderArea": payload.policyHolderArea,
      "agentCode": payload.agentCode,
      "beneficiaryArea": payload.beneficiaryArea,  // beneficiaryArea tetap di sini
      "claimType": payload.claimType  // claimType sekarang di bawah beneficiaryArea
    },
    "riskProfile": {
      "retailRiskProfile": {
        "policyHolderName": payload.policyHolderName,
        "alias": payload.alias,
        "policyHolderIdNumber": payload.policyHolderIdNumber,
        "policyHolderDateOfBirth": payload.policyHolderDateOfBirth,
        "nationality": payload.nationality,
        "policyHolderJob": payload.policyHolderJob,
        "policyCoverageArea": payload.policyCoverageArea,
        "typeOfInsurance": payload.typeOfInsurance,
        "totalPremium": payload.totalPremium,
        "paymentMethod": payload.paymentMethod,
        "insuranceObjective": payload.insuranceObjective,
        "insuranceProduct": payload.insuranceProduct
      }
    }
  };

  try {
    // Debugging: Tampilkan request body yang lengkap
    console.log('Request Body:', JSON.stringify(body, null, 2));

    // Kirimkan permintaan API dengan body yang sudah disesuaikan
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    // Menangani error jika status response bukan 200
    if (!response.ok) {
      const errorDetails = await response.json(); // Ambil detail error dari respons
      console.error('API Error Details:', errorDetails);
      throw new Error(`Request failed with status ${response.status}`);
    }

    // Mengembalikan response dalam bentuk JSON
    const responseJson = await response.json();
    
    // Debugging: Tampilkan seluruh respons API
    console.log('Full Response:', JSON.stringify(responseJson, null, 2));

    return responseJson;
  } catch (error) {
    console.error(`Error while fetching data for claim: ${payload.claimId}`, error);
    throw error; // Melempar kembali error untuk ditangani di tempat lain
  }
}

// Membaca daftar data dari data.json
const data = readJsonData('./data.json'); // Menggunakan path relatif ke data.json

// Data-driven test untuk API
test('API data-driven test', async () => {
  // Loop melalui setiap data dan jalankan tes API
  for (const entry of data) {
    try {
      console.log(`Testing with claim data: ${entry.claimId}, insuranceProduct: ${entry.insuranceProduct}`);
      
      // Kirimkan permintaan API dengan data yang sesuai
      const response = await sendApiRequest(entry, 60000);  // Timeout ditentukan di sini

      // Menampilkan seluruh respons API untuk debugging
      console.log(`Full Response for claim ${entry.claimId}:`, JSON.stringify(response, null, 2));

    } catch (error) {
      console.error(`Error while testing claim ${entry.claimId}:`, error);
    }
  }
});

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
async function sendApiRequest(policyHolderJob: string, name: string, idNumber: string, dob: string, policyCoverageArea: string, typeOfInsurance: string, paymentMethod: string, insuranceProduct: string, sourceRequest: string, timeout: number = 60000) {
  const url = 'https://api-automation-dev.ifg-life.id/v2/ao-fraud/workflow/fraud-checking';
  const headers = {
    'apiKey': 'E97baCBt8SxmDcYNyd3KwbEA0giw8ElF',
    'Content-Type': 'application/json'
  };

  const body = {
    "config": {
      "sourceRequest": sourceRequest, // Menambahkan variabel sourceRequest
      "isRiskProfile": {
        "isRiskProfile": true,
        "riskType": "Retail"
      },
      "screeningApuppt": true
    },
    "screeningAPUPPT": {
      "name": name,
      "idNumber": idNumber,
      "idType": "NIK",
      "dob": dob
    },
    "riskProfile": {
      "retailRiskProfile": {
        "policyHolderName": name,
        "alias": "",
        "beneficiaryName": name,
        "policyHolderIdNumber": idNumber,
        "policyHolderAddress": "",
        "policyHolderPhone": "",
        "policyHolderDateOfBirth": dob,
        "policyHolderPlaceOfBirth": "",
        "beneficiaryDateOfBirth": "",
        "nationality": "INDONESIA",
        "policyHolderJob": policyHolderJob, // Data pekerjaan yang diganti
        "policyHolderJobAddress": "",
        "policyHolderJobPhone": "",
        "policyHolderGender": "",
        "policyHolderMaritalStatus": "",
        "averageEarnings": "",
        "policyCoverageArea": policyCoverageArea,
        "typeOfInsurance": typeOfInsurance,
        "totalPremium": "",
        "paymentMethod": paymentMethod,
        "insuranceStartDate": "",
        "insuranceObjective": "",
        "dataUpdated": "",
        "insuranceProduct": insuranceProduct // Menambahkan variabel insuranceProduct
      }
    }
  };

  // Membuat AbortController untuk mengontrol timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);  // Set timeout sesuai yang diinginkan

  try {
    // Kirimkan permintaan API dengan body yang sudah disesuaikan
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
      signal: controller.signal,  // Menambahkan signal untuk mengontrol timeout
    });

    // Menangani error jika status response bukan 200
    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      throw new Error(`Request failed with status ${response.status}`);
    }

    // Mengembalikan response dalam bentuk JSON
    return await response.json();
  } catch (error) {
    // Menangani error saat permintaan API dibatalkan atau gagal
    console.error(`Error while fetching data for job: ${policyHolderJob}`, error);
    throw error; // Melempar kembali error untuk ditangani di tempat lain
  } finally {
    clearTimeout(timeoutId);  // Menghentikan timeout jika respons diterima sebelum waktu habis
  }
}

// Membaca daftar data dari data.json
const data = readJsonData('./data.json'); // Menggunakan path relatif ke data.json

// Data-driven test untuk API
test('API data-driven test', async () => {
  // Loop melalui setiap data dan jalankan tes API
  for (const entry of data) {
    try {
      console.log(`Testing with name: ${entry.name}, job: ${entry.policyHolderJob}, insuranceProduct: ${entry.insuranceProduct}, sourceRequest: ${entry.sourceRequest}`);
      
      // Kirimkan permintaan API dengan data yang sesuai
      const response = await sendApiRequest(entry.policyHolderJob, entry.name, entry.idNumber, entry.dob, entry.policyCoverageArea, entry.typeOfInsurance, entry.paymentMethod, entry.insuranceProduct, entry.sourceRequest, 60000);

      // Debugging: Periksa apakah respons memiliki policyHolderJob
      console.log('Full Response:', response);

      // Validasi respons API sesuai data pekerjaan
      if (response && response.policyHolderJob) {
        console.log(`Policy Holder Job for ${entry.policyHolderJob}:`, response.policyHolderJob);
        expect(response.policyHolderJob).toBe(entry.policyHolderJob); // Validasi apakah pekerjaan yang dikirim sesuai
      } else {
        console.error(`policyHolderJob not found in the response for job: ${entry.policyHolderJob}`);
        console.log('Full Response:', response); // Menampilkan seluruh respons API untuk debugging
      }

    } catch (error) {
      console.error(`Error while testing job ${entry.policyHolderJob}:`, error);
    }
  }
});

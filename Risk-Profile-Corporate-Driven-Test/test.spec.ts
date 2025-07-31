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

  const body = {
    "config": {
      "sourceRequest": payload.sourceRequest,
      "screeningApuppt": true
    },
    "screeningAPUPPT": {
      "name": payload.name,
      "idNumber": payload.idNumber,
      "idType": "NPWP",
      "dob": payload.dob
    },
    "riskProfile": {
      "corporateRiskProfile": {
        "corporatePolisDataDTO": {
          "policyHolderName": payload.name,  // Menyamakannya dengan nama yang ada di data.json
          "businessLicenseNumber": payload.idNumber,
          "lineOfBusiness": payload.lineOfBusiness,
          "corporateAddress": payload.corporateAddress,
          "placeOfBusiness": payload.placeOfBusiness,
          "dateOfBusiness": payload.dateOfBusiness,
          "formOfBusinessEntity": payload.formOfBusinessEntity,
          "typeOfInsurance": payload.typeOfInsurance,
          "areaClosedPolicy": payload.areaClosedPolicy,
          "paymentMethod": payload.paymentMethod,
          "insuranceProduct": payload.insuranceProduct
        }
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
      const errorDetails = await response.json(); // Ambil detail error dari respons
      console.error('API Error Details:', errorDetails);
      throw new Error(`Request failed with status ${response.status}`);
    }

    // Mengembalikan response dalam bentuk JSON
    return await response.json();
  } catch (error) {
    // Menangani error saat permintaan API dibatalkan atau gagal
    console.error(`Error while fetching data for company: ${payload.name}`, error);
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
      console.log(`Testing with company: ${entry.name}, sourceRequest: ${entry.sourceRequest}, insuranceProduct: ${entry.insuranceProduct}`);
      
      // Kirimkan permintaan API dengan data yang sesuai
      const response = await sendApiRequest(entry, 60000);  // Timeout ditentukan di sini

      // Debugging: Periksa apakah respons memiliki data yang sesuai
      console.log('Full Response:', response);

      // Validasi respons API sesuai data yang dikirim
      if (response && response.data && response.data.corporateRiskProfileCalculation) {
        console.log(`Corporate Risk Profile for ${entry.name}:`, response.data.corporateRiskProfileCalculation);
        expect(response.data.corporateRiskProfileCalculation.policyHolderName).toBe(entry.name); // Validasi apakah nama yang dikirim sesuai
      } else {
        console.error(`Data not found in the response for company: ${entry.name}`);
        console.log('Full Response:', response); // Menampilkan seluruh respons API untuk debugging
      }

    } catch (error) {
      console.error(`Error while testing company ${entry.name}:`, error);
    }
  }
});

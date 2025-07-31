import { test, expect } from '@playwright/test';
import * as fs from 'fs'; // Untuk membaca file JSON
import * as path from 'path'; // Untuk menangani path dengan aman

// Fungsi untuk membaca data dari file JSON
function readJsonData(filePath: string) {
  const fullPath = path.join(__dirname, filePath);  // Menyusun path absolut ke file data.json
  const data = fs.readFileSync(fullPath, 'utf8');  // Membaca file JSON
  return JSON.parse(data);  // Mengonversi data JSON menjadi objek JavaScript
}

// Fungsi untuk melakukan permintaan API dengan data pekerjaan yang berbeda
async function sendApiRequest(policyHolderJob: string, timeout: number = 60000) {
  const url = 'https://api-automation-dev.ifg-life.id/v2/ao-fraud/workflow/fraud-checking';
  const headers = {
    'apiKey': 'E97baCBt8SxmDcYNyd3KwbEA0giw8ElF',
    'Content-Type': 'application/json'
  };

  const body = {
    "config": {
      "sourceRequest": "Legacy Retail",
      "isRiskProfile": {
        "isRiskProfile": true,
        "riskType": "Retail"
      },
      "screeningApuppt": true
    },
    "screeningAPUPPT": {
      "name": "SIT HIGH RISK STATUS",
      "idNumber": "1012047110741073",
      "idType": "NIK",
      "dob": "1993-09-18"
    },
    "riskProfile": {
      "retailRiskProfile": {
        "policyHolderName": "SIT MEDIUM RISK STATUS",
        "alias": "SIT MEDIUM RISK STATUS",
        "beneficiaryName": "SIT MEDIUM RISK STATUS",
        "policyHolderIdNumber": "1012047110741073",
        "policyHolderAddress": "JL. Kebun Mangga V",
        "policyHolderPhone": "088176282791",
        "policyHolderDateOfBirth": "1993-09-18",
        "policyHolderPlaceOfBirth": "Bandung",
        "beneficiaryDateOfBirth": "1993-09-18",
        "nationality": "INDONESIA",
        "policyHolderJob": policyHolderJob, // Data pekerjaan yang diganti
        "policyHolderJobAddress": "JL. Pasir Kuning V",
        "policyHolderJobPhone": "088176282791",
        "policyHolderGender": "Laki-Laki",
        "policyHolderMaritalStatus": "Lajang",
        "averageEarnings": "Rp. 10.000.000",
        "policyCoverageArea": "36.02",
        "typeOfInsurance": "Kecelakaan Diri",
        "totalPremium": "200000000",
        "paymentMethod": "lainnya",
        "insuranceStartDate": "2014-01-09",
        "insuranceObjective": "Pengalihan Resiko",
        "dataUpdated": "2014-10-13",
        "insuranceProduct": "AnuitasPRIMA"
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

// Membaca daftar pekerjaan dari data.json
const jobs = readJsonData('./data.json'); // Menggunakan path relatif ke data.json

// Data-driven test untuk API
test('API data-driven test', async () => {
  // Loop melalui setiap pekerjaan dan jalankan tes API
  for (const job of jobs) {
    try {
      console.log(`Testing with job: ${job}`);
      
      // Kirimkan permintaan API untuk setiap pekerjaan dengan timeout 60 detik
      const response = await sendApiRequest(job, 60000);  // Timeout ditentukan di sini

      // Debugging: Periksa apakah respons memiliki policyHolderJob
      console.log('Full Response:', response);

      // Validasi respons API sesuai data pekerjaan
      if (response && response.policyHolderJob) {
        console.log(`Policy Holder Job for ${job}:`, response.policyHolderJob);
        expect(response.policyHolderJob).toBe(job); // Validasi apakah pekerjaan yang dikirim sesuai
      } else {
        console.error(`policyHolderJob not found in the response for job: ${job}`);
        console.log('Full Response:', response); // Menampilkan seluruh respons API untuk debugging
      }

    } catch (error) {
      console.error(`Error while testing job ${job}:`, error);
    }
  }
});
//npx playwright test  -- Menjalankan test Playwright

//npx playwright test --ui   --Menjalankan test dengan UI reporter


//npm init -y  # Inisialisasi proyek Node.js jika belum ada package.json
//npm install playwright @playwright/test  # Instal Playwright dan Playwright Test

//npx playwright test tests/example.spec.js Menjalankan Tes dengan Opsi

//npx playwright test --headless tanpa tampilan browser

///npx playwright test --reporter=html  # Menampilkan hasil tes dalam format HTML dengan beberapa opsi tampilan HTML


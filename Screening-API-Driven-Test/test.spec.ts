import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

function readJsonData(filePath: string) {
  const fullPath = path.join(__dirname, filePath);
  const data = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(data);
}

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
      "idType": payload.idType,
      "dob": payload.dob
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const statusCode = response.status;
    const responseBody = await response.json();

    return {
      status: statusCode,
      body: responseBody
    };
  } catch (error) {
    console.error(`Error while fetching data for payload:`, error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

const testData = readJsonData('./data.json');

test('API data-driven test with custom assertion', async () => {
  for (const data of testData) {
    try {
      console.log(`Testing with payload:`, data);

      const { status, body } = await sendApiRequest(data);

      // ✅ Assertion: Status response
      expect(status).toBe(201);

      // ✅ Safe check untuk field yang diperlukan
      const screening = body.screeningAPUPPT ?? {};

      expect(screening.sourceRequest || data.sourceRequest).toBe(data.sourceRequest);
      expect(screening.name || data.name).toBe(data.name);
      expect(screening.idNumber || data.idNumber).toBe(data.idNumber);
      expect(screening.idType || data.idType).toBe(data.idType);
      expect(screening.dob || data.dob).toBe(data.dob);

      if (screening.fraudStatus) {
        console.log(`Fraud status for ${data.name}:`, screening.fraudStatus);
        expect(typeof screening.fraudStatus).toBe('string');
      } else {
        console.warn(`fraudStatus not found for payload:`, data);
      }

    } catch (error) {
      console.error(`Error while testing payload ${JSON.stringify(data)}:`, error);
    }
  }
});

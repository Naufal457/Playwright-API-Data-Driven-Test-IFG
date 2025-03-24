import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'desktop-chrome',    // Nama proyek untuk Chrome
      use: { 
        ...devices['Desktop Chrome'],   // Menggunakan perangkat Desktop Chrome
      },
    },
  ],
});

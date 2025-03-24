# Playwright-API-Data-Driven-Test-IFG
This project enables data-driven API testing using Playwright Test. It reads input data from a JSON file and dynamically sends requests to an API endpoint, validating responses automatically. Ideal for testing fraud-check APIs, verifying dynamic payloads, and integrating into CI/CD workflows.

# 🔍 API Data-Driven Test with Playwright

This project is a data-driven automated API testing setup using [Playwright Test](https://playwright.dev/). It dynamically sends requests to an API endpoint using input data from an external JSON file and verifies the responses accordingly.

---

## ✅ Features

- 🔁 **Data-driven testing**: Input values (e.g. job titles) are loaded from `data.json`
- ⚙️ **Reusable API logic**: Centralized request and validation functions
- ⏱️ **Timeout handling**: Custom timeout support per request
- 🧾 **Detailed logging**: Logs full response for debugging when needed
- 📊 **Report generation**: Supports HTML report output for result tracking

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the test suite

```bash
npx playwright test
```

### 3. Run with UI

```bash
npx playwright test --ui
```

### 4. Generate an HTML report

```bash
npx playwright test --reporter=html
```

---

## 🧪 Use Cases

This framework is ideal for:

- Automated API contract validation
- Testing fraud-checking or risk profile endpoints
- Simulating multiple user scenarios via external data
- Integrating into CI/CD pipelines

---

## ⚠️ Notes

- Make sure `data.json` contains an array of valid input values.
- You can customize headers, payloads, and endpoints as needed for your API.

---

## 🤝 Contributing

Feel free to fork, suggest improvements, or open pull requests to enhance this test setup.

---

*Happy testing! 🧪*

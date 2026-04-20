import "@testing-library/jest-dom";

// Mock fetch globally — all API calls return safe defaults
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve([]),
  })
);

// Mock localStorage
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = val; },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};

// Suppress CSS module warnings in test
vi.mock("*.module.css", () => new Proxy({}, { get: (_, key) => key }));

import { render } from "@testing-library/react";

// Helper to mock API responses for specific paths
export function mockApi(responses = {}) {
  global.fetch = vi.fn((url, opts) => {
    const path = url.replace(/^.*\/api\/v1/, "");
    const method = opts?.method || "GET";
    const key = `${method} ${path}`;

    // Try exact match, then method-only match, then default
    const body = responses[key] ?? responses[path] ?? [];

    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(body),
    });
  });
}

// Helper to mock API errors
export function mockApiError(status = 500, message = "Server error") {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve({ message }),
    })
  );
}

// Render with act() wrapper for async components
export { render };

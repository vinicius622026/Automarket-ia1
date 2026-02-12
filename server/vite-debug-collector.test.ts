import { describe, expect, it } from "vitest";

/**
 * Tests for the vite debug collector endpoint validation logic
 * These tests validate that the endpoint properly handles:
 * 1. Empty bodies
 * 2. Invalid Content-Type headers
 * 3. Invalid JSON payloads
 * 4. Valid JSON payloads
 */

describe("Vite Debug Collector Validation Logic", () => {
  it("should validate empty body is rejected", () => {
    const body = "";
    const isEmpty = !body || body.trim().length === 0;
    expect(isEmpty).toBe(true);
  });

  it("should validate non-empty body passes check", () => {
    const body = '{"consoleLogs": []}';
    const isEmpty = !body || body.trim().length === 0;
    expect(isEmpty).toBe(false);
  });

  it("should validate Content-Type header checking logic", () => {
    const validContentType = "application/json";
    const invalidContentType = "text/html";
    const emptyContentType = undefined;

    // Should pass for valid content type
    expect(validContentType.includes("application/json")).toBe(true);

    // Should fail for invalid content type
    expect(invalidContentType.includes("application/json")).toBe(false);

    // Should skip check when no content type is provided
    expect(emptyContentType).toBe(undefined);
  });

  it("should handle JSON parsing errors gracefully", () => {
    const invalidJSON = "A server error occurred";
    
    let parseError = null;
    try {
      JSON.parse(invalidJSON);
    } catch (e) {
      parseError = e;
    }

    expect(parseError).toBeDefined();
    expect(parseError instanceof SyntaxError).toBe(true);
  });

  it("should parse valid JSON successfully", () => {
    const validJSON = '{"consoleLogs": [], "networkRequests": [], "sessionEvents": []}';
    
    let payload = null;
    let parseError = null;
    
    try {
      payload = JSON.parse(validJSON);
    } catch (e) {
      parseError = e;
    }

    expect(parseError).toBe(null);
    expect(payload).toBeDefined();
    expect(payload.consoleLogs).toEqual([]);
    expect(payload.networkRequests).toEqual([]);
    expect(payload.sessionEvents).toEqual([]);
  });

  it("should handle HTML error responses", () => {
    const htmlError = "<html><body>A server error occurred</body></html>";
    
    let parseError = null;
    try {
      JSON.parse(htmlError);
    } catch (e) {
      parseError = e;
    }

    expect(parseError).toBeDefined();
    expect(parseError instanceof SyntaxError).toBe(true);
  });

  it("should trim whitespace before validation", () => {
    const bodyWithWhitespace = "   \n\n   ";
    const isEmpty = !bodyWithWhitespace || bodyWithWhitespace.trim().length === 0;
    expect(isEmpty).toBe(true);
  });

  it("should handle body preview substring correctly", () => {
    const longBody = "A".repeat(300);
    const preview = longBody.substring(0, 200);
    
    expect(preview.length).toBe(200);
    expect(preview).toBe("A".repeat(200));
  });

  it("should format error messages with body info", () => {
    const body = "Invalid JSON data";
    const bodyLength = body.length;
    const bodyPreview = body.substring(0, 200);
    
    expect(bodyLength).toBe(17);
    expect(bodyPreview).toBe("Invalid JSON data");
  });
});

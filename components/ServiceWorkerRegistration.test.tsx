import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

describe("public/sw.js", () => {
  it("is syntactically valid JavaScript", () => {
    const source = readFileSync(
      path.join(process.cwd(), "public/sw.js"),
      "utf-8",
    );
    // Compiling (not executing) is enough to catch syntax errors; the
    // service-worker globals (self, caches) don't exist in this test
    // environment and aren't needed to validate syntax.
    expect(() => new Function(source)).not.toThrow();
  });
});

describe("ServiceWorkerRegistration", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.NODE_ENV = originalEnv;
  });

  it("registers the service worker in production when supported", () => {
    process.env.NODE_ENV = "production";
    const register = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { serviceWorker: { register } });

    render(<ServiceWorkerRegistration />);

    expect(register).toHaveBeenCalledWith("/sw.js");
  });

  it("does not register outside production (avoids stale HMR caching in dev)", () => {
    process.env.NODE_ENV = "development";
    const register = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { serviceWorker: { register } });

    render(<ServiceWorkerRegistration />);

    expect(register).not.toHaveBeenCalled();
  });

  it("does nothing (no throw) when serviceWorker isn't supported", () => {
    process.env.NODE_ENV = "production";
    vi.stubGlobal("navigator", {});

    expect(() => render(<ServiceWorkerRegistration />)).not.toThrow();
  });

  it("swallows a registration failure instead of throwing", async () => {
    process.env.NODE_ENV = "production";
    const register = vi.fn().mockRejectedValue(new Error("blocked"));
    vi.stubGlobal("navigator", { serviceWorker: { register } });

    expect(() => render(<ServiceWorkerRegistration />)).not.toThrow();
    await Promise.resolve();
  });

  it("renders nothing visible", () => {
    process.env.NODE_ENV = "production";
    vi.stubGlobal("navigator", { serviceWorker: { register: vi.fn().mockResolvedValue(undefined) } });
    const { container } = render(<ServiceWorkerRegistration />);
    expect(container).toBeEmptyDOMElement();
  });
});

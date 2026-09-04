import { describe, expect, it, vi } from "vitest";

import { loadResource } from "@/lib/async-resource";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("loadResource", () => {
  it("reports the resolved data then settles", async () => {
    const onData = vi.fn();
    const onError = vi.fn();
    const onSettled = vi.fn();

    loadResource(() => Promise.resolve({ ok: true }), { onData, onError, onSettled });
    await flush();

    expect(onData).toHaveBeenCalledWith({ ok: true });
    expect(onError).not.toHaveBeenCalled();
    expect(onSettled).toHaveBeenCalledOnce();
  });

  it("reports a rejection as an error then settles", async () => {
    const onData = vi.fn();
    const onError = vi.fn();
    const onSettled = vi.fn();
    const err = new Error("network down");

    loadResource(() => Promise.reject(err), { onData, onError, onSettled });
    await flush();

    expect(onData).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(err);
    expect(onSettled).toHaveBeenCalledOnce();
  });

  it("ignores a resolution that arrives after cancel", async () => {
    const onData = vi.fn();
    const onError = vi.fn();
    const onSettled = vi.fn();

    const cancel = loadResource(() => Promise.resolve({ ok: true }), { onData, onError, onSettled });
    cancel();
    await flush();

    expect(onData).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(onSettled).not.toHaveBeenCalled();
  });

  it("ignores a rejection that arrives after cancel", async () => {
    const onData = vi.fn();
    const onError = vi.fn();
    const onSettled = vi.fn();

    const cancel = loadResource(() => Promise.reject(new Error("boom")), { onData, onError, onSettled });
    cancel();
    await flush();

    expect(onData).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(onSettled).not.toHaveBeenCalled();
  });
});

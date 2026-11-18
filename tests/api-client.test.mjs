import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import { createRequire } from "node:module";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";

// Compile the actual client and storage modules using the existing TypeScript
// dependency. No browser, live API or additional test framework is needed.
const directory = mkdtempSync(join(tmpdir(), "bonde-admin-auth-"));
mkdirSync(join(directory, "auth"));
for (const name of ["api-client", "auth/session"]) {
  const source = readFileSync(
    new URL(`../src/lib/${name}.ts`, import.meta.url),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  writeFileSync(join(directory, `${name}.js`), compiled.outputText);
}
const require = createRequire(import.meta.url);
const originalWindow = globalThis.window;
const originalFetch = globalThis.fetch;
let api, session;

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

const credentials = {
  accessToken: "old-access",
  refreshToken: "old-refresh",
  expiresIn: 3600,
  user: { id: "user-1", email: "user@example.test", phone: null },
  remember: false,
};
const rotated = {
  ...credentials,
  accessToken: "new-access",
  refreshToken: "new-refresh",
};
const json = (status, data = {}) =>
  new Response(JSON.stringify(data), { status });
function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

beforeEach(() => {
  globalThis.window = { localStorage: storage(), sessionStorage: storage() };
  for (const name of ["api-client", "auth/session"]) {
    delete require.cache[require.resolve(join(directory, `${name}.js`))];
  }
  ({ api } = require(join(directory, "api-client.js")));
  session = require(join(directory, "auth/session.js"));
  session.saveSession(credentials);
});

after(() => {
  globalThis.window = originalWindow;
  globalThis.fetch = originalFetch;
  rmSync(directory, { recursive: true, force: true });
});

test("concurrent 401s share refresh and preserve session-only storage", async () => {
  const refresh = deferred();
  let refreshes = 0;
  globalThis.fetch = async (url, options) => {
    if (url === "/api/auth/refresh") {
      refreshes++;
      return refresh.promise;
    }
    return options.headers.get("authorization") === "Bearer new-access"
      ? json(200, { ok: true })
      : json(401);
  };
  const first = api.get("/first", { auth: true });
  const second = api.get("/second", { auth: true });
  await new Promise(setImmediate);
  assert.equal(refreshes, 1);
  refresh.resolve(json(200, rotated));
  assert.deepEqual(await Promise.all([first, second]), [
    { ok: true },
    { ok: true },
  ]);
  assert.equal(window.localStorage.getItem("bonde.session"), null);
  assert.equal(session.loadSession().remember, false);
});

for (const failure of ["network", 429, 500, 503]) {
  test(`refresh ${failure} preserves credentials and allows later retry`, async () => {
    let failing = true;
    globalThis.fetch = async (url, options) => {
      if (url === "/api/auth/refresh") {
        if (!failing) return json(200, rotated);
        if (failure === "network") throw new TypeError("offline");
        return json(failure);
      }
      return options.headers.get("authorization") === "Bearer new-access"
        ? json(200, { ok: true })
        : json(401);
    };
    await assert.rejects(api.get("/private", { auth: true }));
    assert.equal(session.getRefreshToken(), credentials.refreshToken);
    failing = false;
    assert.deepEqual(await api.get("/private", { auth: true }), { ok: true });
  });
}

for (const status of [400, 401, 403]) {
  test(`refresh rejection ${status} clears the rejected session`, async () => {
    globalThis.fetch = async (url) =>
      json(url === "/api/auth/refresh" ? status : 401);
    await assert.rejects(api.get("/private", { auth: true }));
    assert.equal(session.loadSession(), null);
  });
}

test("malformed successful refresh cannot replace credentials", async () => {
  globalThis.fetch = async (url) =>
    url === "/api/auth/refresh" ? json(200, {}) : json(401);
  await assert.rejects(api.get("/private", { auth: true }));
  assert.equal(session.loadSession(), null);
});

for (const outcome of [200, 401]) {
  test(`late refresh ${outcome} cannot restore or clear a replacement session`, async () => {
    const refresh = deferred();
    globalThis.fetch = async (url) =>
      url === "/api/auth/refresh" ? refresh.promise : json(401);
    const result = assert.rejects(api.get("/private", { auth: true }));
    await new Promise(setImmediate);
    session.clearSession();
    session.saveSession({
      ...credentials,
      accessToken: "other-access",
      refreshToken: "other-refresh",
    });
    refresh.resolve(json(outcome, rotated));
    await result;
    assert.equal(session.getAccessToken(), "other-access");
  });
}

test("late refresh cannot restore logout", async () => {
  const refresh = deferred();
  globalThis.fetch = async (url) =>
    url === "/api/auth/refresh" ? refresh.promise : json(401);
  const result = assert.rejects(api.get("/private", { auth: true }));
  await new Promise(setImmediate);
  session.clearSession();
  refresh.resolve(json(200, rotated));
  await result;
  assert.equal(session.loadSession(), null);
});

test("late original 401 reuses rotated access token without another refresh", async () => {
  const late = deferred();
  let refreshes = 0;
  globalThis.fetch = async (url, options) => {
    if (url === "/api/auth/refresh") {
      refreshes++;
      return json(200, rotated);
    }
    if (options.headers.get("authorization") === "Bearer new-access")
      return json(200, { ok: true });
    return url === "/api/late" ? late.promise : json(401);
  };
  const oldRequest = api.get("/late", { auth: true });
  await api.get("/first", { auth: true });
  late.resolve(json(401));
  assert.deepEqual(await oldRequest, { ok: true });
  assert.equal(refreshes, 1);
});

test("retried 401 expires credentials without a refresh loop", async () => {
  let refreshes = 0;
  globalThis.fetch = async (url) => {
    if (url === "/api/auth/refresh") {
      refreshes++;
      return json(200, rotated);
    }
    return json(401);
  };
  await assert.rejects(api.get("/private", { auth: true }));
  assert.equal(refreshes, 1);
  assert.equal(session.loadSession(), null);
});

test("successful response from an ended session is not delivered", async () => {
  const response = deferred();
  globalThis.fetch = async () => response.promise;
  const result = assert.rejects(api.get("/private", { auth: true }));
  session.clearSession();
  response.resolve(json(200, { private: true }));
  await result;
});

/**
 * Bun tests do not set the `react-server` export condition, so the real
 * `server-only` package would throw. Mock it for unit tests; Next.js still
 * enforces the real package in Client Component builds.
 */
import { mock } from "bun:test";

mock.module("server-only", () => ({}));

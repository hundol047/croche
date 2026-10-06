/* Offline-only: map "@/x" imports to the compiled .verify-out/src/x at runtime,
 * so the ts-path alias works under plain node (no tsconfig-paths available). */
const path = require('path');
const Module = require('module');
const SRC_ROOT = path.resolve(__dirname, '..', '.verify-out', 'src');

const ZOD_SHIM = path.resolve(__dirname, '..', '.verify-out', 'verify', 'zod-shim', 'index.js');

const orig = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'zod') {
    return orig.call(this, ZOD_SHIM, parent, isMain, options);
  }
  if (request.startsWith('@/')) {
    const rewritten = path.join(SRC_ROOT, request.slice(2));
    return orig.call(this, rewritten, parent, isMain, options);
  }
  return orig.call(this, request, parent, isMain, options);
};

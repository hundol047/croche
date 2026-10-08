/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * OFFLINE TEST RUNNER — NOT part of the shipped app.
 *
 * Injects the harness's describe/it/expect/beforeEach as GLOBALS so the
 * standard Jest-style test files in __tests__ run unchanged, then imports them,
 * then runs. Under real Jest these globals are provided by Jest instead.
 */
import { describe, it, test, expect, beforeEach, run } from './harness';

const g = globalThis as any;
g.describe = describe;
g.it = it;
g.test = test;
g.expect = expect;
g.beforeEach = beforeEach;

// Import test suites (side-effect registers tests via globals).
import '../__tests__/errorDnaEngine.test';
import '../__tests__/memorySelect.test';
import '../__tests__/schemas.test';
import '../__tests__/prediction.test';
import '../__tests__/report.test';
import '../__tests__/storage.test';
import '../__tests__/remediation.test';
import '../__tests__/trapEval.test';
import '../__tests__/learningEvents.test';
import '../__tests__/mockLoop.test';
import '../__tests__/realService.test';
import '../__tests__/serviceStatus.test';
import '../__tests__/answerAssessment.test';
import '../__tests__/questionIssuance.test';
import '../__tests__/practiceBank.test';
import '../__tests__/schoolBank.test';
import '../__tests__/curriculum.test';
import '../__tests__/examIngestion.test';
import '../__tests__/proxyClient.test';

void run();

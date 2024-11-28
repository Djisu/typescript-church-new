// src/@types/vitest.d.ts
declare module 'vitest/globals' {
    export * from 'vitest/tests';
    export const describe: typeof global.describe;
    export const it: typeof global.it;
    export const expect: typeof global.expect;
    export const afterEach: typeof global.afterEach;
    export const beforeEach: typeof global.beforeEach;
    export const vi: typeof global.vi; // Include vi if you use it
}
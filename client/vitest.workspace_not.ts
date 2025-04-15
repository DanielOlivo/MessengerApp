import { defineWorkspace } from 'vitest/config';

// More info at: https://storybook.js.org/docs/writing-tests/test-addon
export default defineWorkspace(['vite.config.ts', 
//   {
//   extends: 'vite.config.ts',
//   plugins: [
//   // The plugin will run tests for the stories defined in your Storybook config
//   // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
//   storybookTest({
//     configDir: path.join(dirname, '.storybook')
//   })],
//   test: {
//     name: 'storybook',
//     browser: {
//       enabled: true,
//       headless: true,
//       name: 'chromium',
//       provider: 'playwright'
//     },
//     setupFiles: ['.storybook/vitest.setup.ts']
//   }
// }, {
//   extends: 'vite.config.ts',
//   plugins: [
//   // The plugin will run tests for the stories defined in your Storybook config
//   // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
//   storybookTest({
//     configDir: path.join(dirname, '.storybook')
//   })],
//   test: {
//     name: 'storybook',
//     browser: {
//       enabled: true,
//       headless: true,
//       provider: 'playwright',
//       instances: [{
//         browser: 'chromium'
//       }]
//     },
//     setupFiles: ['.storybook/vitest.setup.ts']
//   }
// }, {
//   extends: 'vite.config.ts',
//   plugins: [
//   // The plugin will run tests for the stories defined in your Storybook config
//   // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
//   storybookTest({
//     configDir: path.join(dirname, '.storybook')
//   })],
//   test: {
//     name: 'storybook',
//     browser: {
//       enabled: true,
//       headless: true,
//       provider: 'playwright',
//       instances: [{
//         browser: 'chromium'
//       }]
//     },
//     setupFiles: ['.storybook/vitest.setup.ts']
//   }
// }
]);
import type { Preview } from "@storybook/react";
import { initialize, mswLoader } from 'msw-storybook-addon'
import "../src/index.css"

let options = {}
if(location.hostname === 'http://localhost:6006'){
  options = {
    serviceWorker: {
      url: './mockServiceWorker.js'
    }
  }
}

// initialize()
initialize(options)

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader] 
};

export default preview;
import type { Preview } from '@storybook/react';
import '../src/index.css';

const INITIAL_VIEWPORT = 'iphone14';

export const parameters = {
  // iOS portrait viewport
  viewport: {
    viewports: {
      iphone14: {
        name: 'iPhone 14',
        width: 390,
        height: 844,
        defaultViewport: true,
      },
    },
    // Override global viewport to iPhone 14 portrait
    overrides: ({ viewports, defaultViewport }) => ({
      ...defaultViewport,
      viewport: {
        ...viewports.iphone14,
        // Force portrait orientation
        type: 'portrait',
      },
    }),
  },
  // Force iPhone 14 portrait as initial viewport
  initialGlobals: {
    viewport: {
      value: 'iphone14',
      isRotated: false,
    },
  },
  // Dark background matching Space theme
  backgrounds: {
    default: 'space',
    values: [{ name: 'space', value: '#0d1117' }],
  },
  // iOS safe-area simulator decorator
  decorators: [
    (Story: any) => (
      <div
        style={{
          maxWidth: '430px',
          margin: '0 auto',
          minHeight: '100dvh',
          overflowX: 'hidden',
          paddingTop: 'env(safe-area-inset-top, 44px)',
          paddingBottom: 'env(safe-area-inset-bottom, 34px)',
          paddingLeft: 'env(safe-area-inset-left, 44px)',
          paddingRight: 'env(safe-area-inset-right, 44px)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const globals = {
  // Enable dark mode by default
  class: ['dark'],
};

const preview: Preview = {
  ...parameters,
  globals,
};

export default preview;

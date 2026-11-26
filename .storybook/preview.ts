import type { Preview } from "@storybook/react";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color|primary|secondary|accent|destructive|border|ring|outline|shadow|fill|stroke|backgroundColor|backgroundColor)/i,
        fill: /(background|color|primary|secondary|accent|destructive|border|ring|outline|shadow|fill|stroke|backgroundColor|backgroundColor)/i,
        stroke: /(background|color|primary|secondary|accent|destructive|border|ring|outline|shadow|fill|stroke|backgroundColor|backgroundColor)/i,
      },
    },
    backgrounds: {
      default: "dark",
      themes: [
        {
          name: "dark",
          value: "#0a0a1a",
          default: true,
        },
      ],
    },
  },
  decorators: [],
};

export default preview;
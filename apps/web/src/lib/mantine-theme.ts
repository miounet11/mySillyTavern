/**
 * Mantine UI Theme Configuration
 * Coordinated with existing Tailwind dark theme design
 */

import { MantineThemeOverride } from '@mantine/core'

export const mantineTheme: MantineThemeOverride = {
  colorScheme: 'dark',
  
  colors: {
    // Brand colors - matching existing design
    brand: [
      '#e0f2ff', // 50
      '#b8e1ff', // 100
      '#8fcfff', // 200
      '#66bdff', // 300
      '#3dabff', // 400
      '#3b82f6', // 500 - primary blue
      '#2563eb', // 600
      '#1d4ed8', // 700
      '#1e40af', // 800
      '#1e3a8a', // 900
    ],
    // Dark grays matching Tailwind
    dark: [
      '#d1d5db', // 300
      '#9ca3af', // 400
      '#6b7280', // 500
      '#4b5563', // 600
      '#374151', // 700
      '#1f2937', // 800 - bg-gray-800
      '#111827', // 900 - bg-gray-900
      '#0a0e1a', // 950 - custom darker
      '#050810', // custom darkest
    ],
  },

  primaryColor: 'brand',
  
  defaultRadius: 'md', // 0.5rem - matching Tailwind rounded-md
  
  fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  fontFamilyMonospace: 'var(--font-mono), Consolas, Monaco, monospace',
  
  headings: {
    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    fontWeight: '600',
  },

  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 500,
          transition: 'all 0.2s ease',
        },
      },
    },
    Input: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          backgroundColor: 'rgb(31, 41, 55)', // gray-800
          borderColor: 'rgb(75, 85, 99)', // gray-600
          color: 'rgb(243, 244, 246)', // gray-100
          '&:focus': {
            borderColor: 'rgb(59, 130, 246)', // blue-500
          },
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: 'rgba(31, 41, 55, 0.5)', // gray-800/50
          borderColor: 'rgb(55, 65, 81)', // gray-700
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgb(31, 41, 55)', // gray-800
          },
        },
      },
    },
    Badge: {
      styles: {
        root: {
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: 'subtle',
      },
    },
    Stack: {
      defaultProps: {
        gap: 'md',
      },
    },
  },

  // Global styles
  globalStyles: (theme) => ({
    body: {
      backgroundColor: theme.colors.dark[6], // gray-900
      color: theme.colors.dark[0], // gray-300
    },
  }),

  other: {
    // Custom values for specific use cases
    borderColor: 'rgb(55, 65, 81)', // gray-700
    hoverBg: 'rgba(59, 130, 246, 0.1)', // blue-500/10
  },
}


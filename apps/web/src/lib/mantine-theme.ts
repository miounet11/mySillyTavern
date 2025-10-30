/**
 * Mantine UI Theme Configuration
 * Coordinated with existing Tailwind dark theme design
 */

import { MantineThemeOverride } from '@mantine/core'

export const mantineTheme: MantineThemeOverride = {
  colors: {
    // Brand colors - matching existing design
    brand: [
      '#f0f9ff', // 0
      '#e0f2ff', // 1
      '#b8e1ff', // 2
      '#8fcfff', // 3
      '#66bdff', // 4
      '#3dabff', // 5
      '#3b82f6', // 6 - primary blue
      '#2563eb', // 7
      '#1d4ed8', // 8
      '#1e40af', // 9
    ],
    // Dark grays matching Tailwind
    dark: [
      '#f3f4f6', // 0 - gray-100
      '#e5e7eb', // 1 - gray-200
      '#d1d5db', // 2 - gray-300
      '#9ca3af', // 3 - gray-400
      '#6b7280', // 4 - gray-500
      '#4b5563', // 5 - gray-600
      '#374151', // 6 - gray-700
      '#1f2937', // 7 - bg-gray-800
      '#111827', // 8 - bg-gray-900
      '#0a0e1a', // 9 - custom darker
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

  other: {
    // Custom values for specific use cases
    borderColor: 'rgb(55, 65, 81)', // gray-700
    hoverBg: 'rgba(59, 130, 246, 0.1)', // blue-500/10
  },
}


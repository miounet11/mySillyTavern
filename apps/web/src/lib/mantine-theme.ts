/**
 * Mantine UI Theme Configuration
 * Enhanced for complete app-wide consistency
 */

import { createTheme, MantineColorsTuple } from '@mantine/core'

// Brand colors - matching existing design
const brandColors: MantineColorsTuple = [
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
]

// Success colors (green)
const successColors: MantineColorsTuple = [
  '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac',
  '#4ade80', '#22c55e', '#16a34a', '#15803d',
  '#166534', '#14532d'
]

// Error colors (red)
const errorColors: MantineColorsTuple = [
  '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5',
  '#f87171', '#ef4444', '#dc2626', '#b91c1c',
  '#991b1b', '#7f1d1d'
]

// Warning colors (yellow/amber)
const warningColors: MantineColorsTuple = [
  '#fffbeb', '#fef3c7', '#fde68a', '#fcd34d',
  '#fbbf24', '#f59e0b', '#d97706', '#b45309',
  '#92400e', '#78350f'
]

// Info colors (cyan)
const infoColors: MantineColorsTuple = [
  '#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9',
  '#22d3ee', '#06b6d4', '#0891b2', '#0e7490',
  '#155e75', '#164e63'
]

export const mantineTheme = createTheme({
  colors: {
    brand: brandColors,
    success: successColors,
    error: errorColors,
    warning: warningColors,
    info: infoColors,
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
  defaultRadius: 'md',
  
  fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  fontFamilyMonospace: 'var(--font-mono), Consolas, Monaco, monospace',
  
  headings: {
    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    fontWeight: '600',
  },

  components: {
    AppShell: {
      styles: {
        main: {
          backgroundColor: 'rgb(3, 7, 18)', // gray-950
        },
        header: {
          backgroundColor: 'rgb(17, 24, 39)', // gray-900
          borderBottom: '1px solid rgb(55, 65, 81)', // gray-700
        },
        navbar: {
          backgroundColor: 'rgb(17, 24, 39)', // gray-900
          borderRight: '1px solid rgb(55, 65, 81)', // gray-700
        },
      },
    },
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
          '&::placeholder': {
            color: 'rgb(156, 163, 175)', // gray-400
          },
        },
        wrapper: {
          '& input[disabled]': {
            backgroundColor: 'rgb(17, 24, 39)', // gray-900
            color: 'rgb(107, 114, 128)', // gray-500
          },
        },
      },
    },
    Textarea: {
      styles: {
        input: {
          backgroundColor: 'rgb(31, 41, 55)',
          borderColor: 'rgb(75, 85, 99)',
          color: 'rgb(243, 244, 246)',
          '&:focus': {
            borderColor: 'rgb(59, 130, 246)',
          },
          '&::placeholder': {
            color: 'rgb(156, 163, 175)',
          },
        },
      },
    },
    Select: {
      styles: {
        input: {
          backgroundColor: 'rgb(31, 41, 55)',
          borderColor: 'rgb(75, 85, 99)',
          color: 'rgb(243, 244, 246)',
        },
        dropdown: {
          backgroundColor: 'rgb(31, 41, 55)',
          borderColor: 'rgb(75, 85, 99)',
        },
        option: {
          color: 'rgb(243, 244, 246)',
          '&[data-hovered]': {
            backgroundColor: 'rgb(55, 65, 81)',
          },
          '&[data-selected]': {
            backgroundColor: 'rgb(59, 130, 246)',
          },
        },
      },
    },
    Modal: {
      styles: {
        content: {
          backgroundColor: 'rgb(17, 24, 39)',
        },
        header: {
          backgroundColor: 'rgb(17, 24, 39)',
          borderBottom: '1px solid rgb(55, 65, 81)',
        },
        title: {
          color: 'rgb(243, 244, 246)',
          fontWeight: 600,
        },
        close: {
          color: 'rgb(156, 163, 175)',
          '&:hover': {
            backgroundColor: 'rgb(55, 65, 81)',
            color: 'rgb(243, 244, 246)',
          },
        },
        body: {
          color: 'rgb(209, 213, 219)',
        },
      },
    },
    Drawer: {
      styles: {
        content: {
          backgroundColor: 'rgb(17, 24, 39)',
        },
        header: {
          backgroundColor: 'rgb(17, 24, 39)',
          borderBottom: '1px solid rgb(55, 65, 81)',
        },
        title: {
          color: 'rgb(243, 244, 246)',
          fontWeight: 600,
        },
        close: {
          color: 'rgb(156, 163, 175)',
          '&:hover': {
            backgroundColor: 'rgb(55, 65, 81)',
            color: 'rgb(243, 244, 246)',
          },
        },
        body: {
          color: 'rgb(209, 213, 219)',
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
          backgroundColor: 'rgba(31, 41, 55, 0.5)',
          borderColor: 'rgb(55, 65, 81)',
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgb(31, 41, 55)',
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
      styles: {
        root: {
          color: 'rgb(156, 163, 175)',
          '&:hover': {
            backgroundColor: 'rgb(55, 65, 81)',
            color: 'rgb(243, 244, 246)',
          },
        },
      },
    },
    Menu: {
      styles: {
        dropdown: {
          backgroundColor: 'rgb(31, 41, 55)',
          borderColor: 'rgb(75, 85, 99)',
        },
        item: {
          color: 'rgb(243, 244, 246)',
          '&:hover': {
            backgroundColor: 'rgb(55, 65, 81)',
          },
          '&[data-hovered]': {
            backgroundColor: 'rgb(55, 65, 81)',
          },
        },
        itemLabel: {
          color: 'rgb(243, 244, 246)',
        },
      },
    },
    Tabs: {
      styles: {
        root: {
          backgroundColor: 'transparent',
        },
        tab: {
          color: 'rgb(156, 163, 175)',
          '&:hover': {
            backgroundColor: 'rgb(31, 41, 55)',
            color: 'rgb(209, 213, 219)',
          },
          '&[data-active]': {
            color: 'rgb(96, 165, 250)',
            borderColor: 'rgb(59, 130, 246)',
          },
        },
        panel: {
          color: 'rgb(209, 213, 219)',
        },
      },
    },
    Table: {
      styles: {
        table: {
          backgroundColor: 'rgb(17, 24, 39)',
          borderColor: 'rgb(55, 65, 81)',
        },
        th: {
          backgroundColor: 'rgb(31, 41, 55)',
          color: 'rgb(209, 213, 219)',
          fontWeight: 600,
          borderColor: 'rgb(55, 65, 81)',
        },
        tr: {
          '&:hover': {
            backgroundColor: 'rgb(31, 41, 55)',
          },
        },
        td: {
          color: 'rgb(243, 244, 246)',
          borderColor: 'rgb(55, 65, 81)',
        },
      },
    },
    ScrollArea: {
      styles: {
        viewport: {
          '& > div': {
            display: 'block !important',
          },
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          color: 'rgb(156, 163, 175)',
          borderRadius: '0.5rem',
          '&:hover': {
            backgroundColor: 'rgb(31, 41, 55)',
            color: 'rgb(209, 213, 219)',
          },
          '&[data-active]': {
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: 'rgb(96, 165, 250)',
          },
        },
        label: {
          fontWeight: 500,
        },
      },
    },
    Tooltip: {
      styles: {
        tooltip: {
          backgroundColor: 'rgb(31, 41, 55)',
          color: 'rgb(243, 244, 246)',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
        },
      },
    },
    Switch: {
      styles: {
        track: {
          backgroundColor: 'rgb(55, 65, 81)',
          border: 'none',
          cursor: 'pointer',
        },
        thumb: {
          backgroundColor: 'rgb(243, 244, 246)',
          border: 'none',
        },
      },
    },
    Stack: {
      defaultProps: {
        gap: 'md',
      },
    },
  },

  other: {
    borderColor: 'rgb(55, 65, 81)',
    hoverBg: 'rgba(59, 130, 246, 0.1)',
  },
})


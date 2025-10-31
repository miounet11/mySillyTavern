/**
 * Mantine UI Theme Configuration
 * Refined Rose Gold Theme - Integrated with Design System
 */

import { createTheme, MantineColorsTuple } from '@mantine/core'

// Refined Rose Gold Brand Colors - matching design system
const brandColors: MantineColorsTuple = [
  '#FCE7F3', // 0 - ultra light rose (--primary-rose-ultra-light)
  '#FCE7F3', // 1
  '#F472B6', // 2 - light rose (--primary-rose-light)
  '#F472B6', // 3
  '#F472B6', // 4
  '#D94680', // 5 - main rose (--primary-rose)
  '#D94680', // 6 - primary rose (main color)
  '#D94680', // 7
  '#B91C5C', // 8 - dark rose (--primary-rose-dark)
  '#9F1239', // 9 - darker rose
]

// Accent Gold Colors - matching design system
const accentColors: MantineColorsTuple = [
  '#FEF3C7', // 0 - light gold (--accent-gold-light)
  '#FEF3C7', // 1
  '#FCD34D', // 2 - main gold (--accent-gold)
  '#FCD34D', // 3
  '#FCD34D', // 4
  '#FCD34D', // 5
  '#EAB308', // 6 - dark gold (--accent-gold-dark)
  '#EAB308', // 7
  '#CA8A04', // 8
  '#A16207', // 9
]

// Success colors (green) - keep existing
const successColors: MantineColorsTuple = [
  '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac',
  '#4ade80', '#22c55e', '#16a34a', '#15803d',
  '#166534', '#14532d'
]

// Error colors (red) - keep existing
const errorColors: MantineColorsTuple = [
  '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5',
  '#f87171', '#ef4444', '#dc2626', '#b91c1c',
  '#991b1b', '#7f1d1d'
]

// Warning colors (yellow/amber) - refined to match gold accent
const warningColors: MantineColorsTuple = [
  '#FEF3C7', // 0 - light gold
  '#FEF3C7', // 1
  '#FCD34D', // 2 - main gold
  '#FCD34D', // 3
  '#FCD34D', // 4
  '#EAB308', // 5 - dark gold
  '#EAB308', // 6
  '#CA8A04', // 7
  '#A16207', // 8
  '#854D0E', // 9
]

// Info colors (cyan) - keep existing
const infoColors: MantineColorsTuple = [
  '#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9',
  '#22d3ee', '#06b6d4', '#0891b2', '#0e7490',
  '#155e75', '#164e63'
]

export const mantineTheme = createTheme({
  colors: {
    brand: brandColors,
    accent: accentColors,
    success: successColors,
    error: errorColors,
    warning: warningColors,
    info: infoColors,
    // Dark background colors matching design system
    dark: [
      '#F5E6F0', // 0 - text-primary (warm white)
      '#D1B3C4', // 1 - text-secondary (rose gray)
      '#A78BAA', // 2 - text-tertiary
      '#8B6F8F', // 3
      '#6B4E6F', // 4
      '#4B2E4F', // 5
      '#3D2442', // 6
      '#2A1A2E', // 7 - bg-overlay
      '#1A0F2E', // 8 - bg-base-end
      '#0F0B1A', // 9 - bg-base-start
    ],
  },

  primaryColor: 'brand',
  defaultRadius: 'md',
  
  fontFamily: 'var(--font-sans), Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  fontFamilyMonospace: 'var(--font-mono), JetBrains Mono, Consolas, Monaco, monospace',
  
  headings: {
    fontFamily: 'var(--font-sans), Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    fontWeight: 'var(--font-semibold)',
    sizes: {
      h1: { fontSize: 'var(--font-4xl)', lineHeight: 'var(--leading-tight)' },
      h2: { fontSize: 'var(--font-3xl)', lineHeight: 'var(--leading-tight)' },
      h3: { fontSize: 'var(--font-2xl)', lineHeight: 'var(--leading-normal)' },
      h4: { fontSize: 'var(--font-xl)', lineHeight: 'var(--leading-normal)' },
      h5: { fontSize: 'var(--font-lg)', lineHeight: 'var(--leading-normal)' },
      h6: { fontSize: 'var(--font-base)', lineHeight: 'var(--leading-normal)' },
    },
  },

  spacing: {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)',
  },

  radius: {
    xs: 'var(--radius-sm)',
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
  },

  shadows: {
    xs: 'var(--shadow-sm)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
  },

  components: {
    AppShell: {
      styles: {
        main: {
          backgroundColor: 'hsl(var(--bg-base-start))',
          background: 'linear-gradient(to bottom, hsl(var(--bg-base-start)) 0%, hsl(var(--bg-base-end)) 100%)',
        },
        header: {
          backgroundColor: 'hsl(var(--bg-overlay))',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid hsl(var(--primary-rose) / 0.3)',
        },
        navbar: {
          backgroundColor: 'hsl(var(--bg-card))',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid hsl(var(--primary-rose) / 0.3)',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 'var(--font-medium)',
          fontSize: 'var(--font-base)',
          transition: 'all 0.3s ease',
          '&[data-variant="filled"]': {
            background: 'linear-gradient(135deg, hsl(var(--primary-rose)) 0%, hsl(var(--accent-gold)) 100%)',
            border: '1px solid hsl(var(--accent-gold) / 0.3)',
            boxShadow: 'var(--shadow-rose)',
            '&:hover': {
              background: 'linear-gradient(135deg, hsl(var(--primary-rose-dark)) 0%, hsl(var(--accent-gold-dark)) 100%)',
              transform: 'translateY(-2px)',
              boxShadow: 'var(--shadow-rose-gold)',
            },
          },
          '&[data-variant="gradient"]': {
            background: 'linear-gradient(135deg, hsl(var(--primary-rose)) 0%, hsl(var(--accent-gold)) 100%)',
            border: '1px solid hsl(var(--accent-gold) / 0.3)',
            boxShadow: 'var(--shadow-rose-gold)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 'var(--shadow-rose-gold), var(--shadow-xl)',
            },
          },
        },
      },
    },
    Input: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          backgroundColor: 'hsl(var(--bg-card))',
          borderColor: 'hsl(var(--primary-rose) / 0.3)',
          color: 'hsl(var(--text-primary))',
          fontSize: 'var(--font-base)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          '&:focus': {
            borderColor: 'hsl(var(--primary-rose))',
            boxShadow: 'var(--shadow-rose)',
            backgroundColor: 'hsl(var(--bg-overlay))',
          },
          '&::placeholder': {
            color: 'hsl(var(--text-secondary))',
          },
        },
        wrapper: {
          '& input[disabled]': {
            backgroundColor: 'hsl(var(--bg-card))',
            color: 'hsl(var(--text-tertiary))',
            opacity: 0.5,
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          backgroundColor: 'hsl(var(--bg-card))',
          borderColor: 'hsl(var(--primary-rose) / 0.3)',
          color: 'hsl(var(--text-primary))',
          fontSize: 'var(--font-base)',
          lineHeight: 'var(--leading-normal)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          '&:focus': {
            borderColor: 'hsl(var(--primary-rose))',
            boxShadow: 'var(--shadow-rose)',
            backgroundColor: 'hsl(var(--bg-overlay))',
          },
          '&::placeholder': {
            color: 'hsl(var(--text-secondary))',
          },
        },
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          backgroundColor: 'hsl(var(--bg-card))',
          borderColor: 'hsl(var(--primary-rose) / 0.3)',
          color: 'hsl(var(--text-primary))',
          fontSize: 'var(--font-base)',
          '&:focus': {
            borderColor: 'hsl(var(--primary-rose))',
            boxShadow: 'var(--shadow-rose)',
          },
        },
        dropdown: {
          backgroundColor: 'hsl(var(--bg-overlay))',
          backdropFilter: 'blur(12px)',
          borderColor: 'hsl(var(--primary-rose) / 0.3)',
          boxShadow: 'var(--shadow-xl)',
        },
        option: {
          color: 'hsl(var(--text-primary))',
          fontSize: 'var(--font-base)',
          '&[data-hovered]': {
            backgroundColor: 'hsl(var(--primary-rose) / 0.1)',
          },
          '&[data-selected]': {
            backgroundColor: 'hsl(var(--primary-rose) / 0.2)',
            color: 'hsl(var(--text-primary))',
          },
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
      },
      styles: {
        content: {
          backgroundColor: 'hsl(var(--bg-overlay))',
          backdropFilter: 'blur(12px)',
          border: '1px solid hsl(var(--primary-rose) / 0.4)',
          boxShadow: 'var(--shadow-rose-gold)',
        },
        header: {
          backgroundColor: 'transparent',
          borderBottom: '1px solid hsl(var(--primary-rose) / 0.3)',
          padding: 'var(--spacing-lg)',
        },
        title: {
          color: 'hsl(var(--text-primary))',
          fontWeight: 'var(--font-semibold)',
          fontSize: 'var(--font-xl)',
        },
        close: {
          color: 'hsl(var(--text-secondary))',
          '&:hover': {
            backgroundColor: 'hsl(var(--primary-rose) / 0.1)',
            color: 'hsl(var(--text-primary))',
          },
        },
        body: {
          color: 'hsl(var(--text-primary))',
          padding: 'var(--spacing-lg)',
        },
      },
    },
    Drawer: {
      defaultProps: {
        radius: 'lg',
      },
      styles: {
        content: {
          backgroundColor: 'hsl(var(--bg-overlay))',
          backdropFilter: 'blur(12px)',
          border: '1px solid hsl(var(--primary-rose) / 0.4)',
        },
        header: {
          backgroundColor: 'transparent',
          borderBottom: '1px solid hsl(var(--primary-rose) / 0.3)',
          padding: 'var(--spacing-lg)',
        },
        title: {
          color: 'hsl(var(--text-primary))',
          fontWeight: 'var(--font-semibold)',
          fontSize: 'var(--font-xl)',
        },
        close: {
          color: 'hsl(var(--text-secondary))',
          '&:hover': {
            backgroundColor: 'hsl(var(--primary-rose) / 0.1)',
            color: 'hsl(var(--text-primary))',
          },
        },
        body: {
          color: 'hsl(var(--text-primary))',
          padding: 'var(--spacing-lg)',
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(10px)',
          borderColor: 'hsl(var(--primary-rose) / 0.3)',
          transition: 'all 0.3s ease',
          boxShadow: 'var(--shadow-md)',
          '&:hover': {
            backgroundColor: 'hsl(var(--bg-overlay))',
            borderColor: 'hsl(var(--primary-rose) / 0.8)',
            boxShadow: 'var(--shadow-rose-gold)',
          },
        },
      },
    },
    Badge: {
      styles: {
        root: {
          fontWeight: 'var(--font-medium)',
          fontSize: 'var(--font-xs)',
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          borderRadius: 'var(--radius-full)',
          '&[data-variant="filled"]': {
            background: 'linear-gradient(135deg, hsl(var(--primary-rose)) 0%, hsl(var(--accent-gold)) 100%)',
            color: 'hsl(var(--text-primary))',
            boxShadow: 'var(--shadow-rose)',
          },
          '&[data-variant="light"]': {
            backgroundColor: 'hsl(var(--primary-rose) / 0.15)',
            color: 'hsl(var(--primary-rose-light))',
            border: '1px solid hsl(var(--primary-rose) / 0.4)',
          },
        },
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: 'subtle',
        radius: 'md',
      },
      styles: {
        root: {
          color: 'hsl(var(--text-secondary))',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'hsl(var(--primary-rose) / 0.1)',
            color: 'hsl(var(--text-primary))',
            boxShadow: 'var(--shadow-rose)',
          },
        },
      },
    },
    Menu: {
      styles: {
        dropdown: {
          backgroundColor: 'hsl(var(--bg-overlay))',
          backdropFilter: 'blur(12px)',
          borderColor: 'hsl(var(--primary-rose) / 0.3)',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-sm)',
        },
        item: {
          color: 'hsl(var(--text-primary))',
          fontSize: 'var(--font-base)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          '&:hover': {
            backgroundColor: 'hsl(var(--primary-rose) / 0.1)',
          },
          '&[data-hovered]': {
            backgroundColor: 'hsl(var(--primary-rose) / 0.1)',
          },
          '&[data-selected]': {
            backgroundColor: 'hsl(var(--primary-rose) / 0.2)',
            color: 'hsl(var(--text-primary))',
          },
        },
        itemLabel: {
          color: 'hsl(var(--text-primary))',
        },
      },
    },
    Tabs: {
      styles: {
        root: {
          backgroundColor: 'transparent',
        },
        list: {
          borderBottom: '1px solid hsl(var(--primary-rose) / 0.3)',
        },
        tab: {
          color: 'hsl(var(--text-secondary))',
          fontSize: 'var(--font-base)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'hsl(var(--primary-rose) / 0.1)',
            color: 'hsl(var(--text-primary))',
          },
          '&[data-active]': {
            color: 'hsl(var(--primary-rose-light))',
            borderColor: 'hsl(var(--primary-rose))',
            backgroundColor: 'hsl(var(--primary-rose) / 0.1)',
          },
        },
        panel: {
          color: 'hsl(var(--text-primary))',
          padding: 'var(--spacing-lg)',
        },
      },
    },
    Table: {
      styles: {
        table: {
          backgroundColor: 'hsl(var(--bg-card))',
          borderColor: 'hsl(var(--primary-rose) / 0.3)',
        },
        th: {
          backgroundColor: 'hsl(var(--bg-overlay))',
          color: 'hsl(var(--text-primary))',
          fontWeight: 'var(--font-semibold)',
          fontSize: 'var(--font-sm)',
          borderColor: 'hsl(var(--primary-rose) / 0.3)',
          padding: 'var(--spacing-md)',
        },
        tr: {
          '&:hover': {
            backgroundColor: 'hsl(var(--primary-rose) / 0.05)',
          },
        },
        td: {
          color: 'hsl(var(--text-primary))',
          borderColor: 'hsl(var(--primary-rose) / 0.2)',
          padding: 'var(--spacing-md)',
          fontSize: 'var(--font-base)',
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
        scrollbar: {
          '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
            background: 'linear-gradient(180deg, hsl(var(--primary-rose)), hsl(var(--accent-gold)))',
            borderRadius: 'var(--radius-md)',
            '&:hover': {
              background: 'linear-gradient(180deg, hsl(var(--primary-rose-dark)), hsl(var(--accent-gold-dark)))',
            },
          },
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          color: 'hsl(var(--text-secondary))',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-base)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'hsl(var(--primary-rose) / 0.1)',
            color: 'hsl(var(--text-primary))',
            boxShadow: 'var(--shadow-rose)',
          },
          '&[data-active]': {
            backgroundColor: 'linear-gradient(135deg, hsl(var(--primary-rose) / 0.2), hsl(var(--accent-gold) / 0.1))',
            background: 'linear-gradient(135deg, hsl(var(--primary-rose) / 0.2), hsl(var(--accent-gold) / 0.1))',
            color: 'hsl(var(--text-primary))',
            border: '1px solid hsl(var(--primary-rose) / 0.4)',
            boxShadow: 'var(--shadow-rose)',
          },
        },
        label: {
          fontWeight: 'var(--font-medium)',
        },
      },
    },
    Tooltip: {
      styles: {
        tooltip: {
          backgroundColor: 'hsl(var(--bg-overlay))',
          backdropFilter: 'blur(10px)',
          color: 'hsl(var(--text-primary))',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-sm)',
          border: '1px solid hsl(var(--primary-rose) / 0.3)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--spacing-xs) var(--spacing-sm)',
        },
      },
    },
    Switch: {
      styles: {
        track: {
          backgroundColor: 'hsl(var(--bg-card))',
          border: '1px solid hsl(var(--primary-rose) / 0.3)',
          cursor: 'pointer',
        },
        thumb: {
          backgroundColor: 'hsl(var(--text-primary))',
          border: 'none',
        },
      },
    },
    Stack: {
      defaultProps: {
        gap: 'md',
      },
    },
    Group: {
      defaultProps: {
        gap: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(10px)',
          borderColor: 'hsl(var(--primary-rose) / 0.3)',
        },
      },
    },
  },

  other: {
    borderColor: 'hsl(var(--primary-rose) / 0.3)',
    hoverBg: 'hsl(var(--primary-rose) / 0.1)',
  },
})


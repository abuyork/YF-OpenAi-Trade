import { createTheme, alpha, Theme } from '@mui/material';

// Define color palette constants
const COLORS = {
  primary: {
    main: '#2C3E50',  // Elegant dark blue
    light: '#34495E',
    dark: '#1A252F',
  },
  secondary: {
    main: '#E67E22',  // Premium orange
    light: '#F39C12',
    dark: '#D35400',
  },
  accent: {
    main: '#16A085',  // Sophisticated teal
    light: '#1ABC9C',
    dark: '#0E6655',
  },
  success: {
    main: '#27AE60',
    light: '#2ECC71',
    dark: '#219A52',
  },
  warning: {
    main: '#F1C40F',
    light: '#F4D03F',
    dark: '#D4AC0D',
  },
  error: {
    main: '#E74C3C',
    light: '#EC7063',
    dark: '#C0392B',
  },
};

export const getTheme = (isDarkMode: boolean): Theme => {
  return createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: COLORS.primary,
      secondary: COLORS.secondary,
      error: COLORS.error,
      warning: COLORS.warning,
      success: COLORS.success,
      background: {
        default: isDarkMode ? '#1E272E' : '#F5F6FA',
        paper: isDarkMode ? '#2D3436' : '#FFFFFF',
      },
      text: {
        primary: isDarkMode ? '#F5F6FA' : '#2D3436',
        secondary: isDarkMode ? '#B2BEC3' : '#636E72',
      },
    },
    typography: {
      fontFamily: "'Inter', 'system-ui', '-apple-system', sans-serif",
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        background: `linear-gradient(135deg, ${COLORS.primary.main}, ${COLORS.accent.main})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: '1.1rem',
        letterSpacing: '0.01em',
      },
      subtitle2: {
        fontSize: '0.9rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.9rem',
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.02em',
        textTransform: 'none',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: '1rem',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            backdropFilter: 'blur(10px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 32px ${alpha(
                theme.palette.mode === 'dark' ? '#000' : '#2563EB',
                0.15
              )}`,
            },
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            height: '40px', // Match dropdown height
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
          },
          contained: ({ }) => ({
            background: `linear-gradient(135deg, ${COLORS.primary.main}, ${COLORS.accent.main})`,
            color: '#FFFFFF',
            '&:hover': {
              background: `linear-gradient(135deg, ${COLORS.primary.dark}, ${COLORS.accent.dark})`,
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 24px ${alpha(COLORS.primary.main, 0.25)}`,
            },
          }),
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '0.75rem',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#1E272E' : '#FFFFFF',
            boxShadow: `0 1px 3px ${alpha(COLORS.primary.main, 0.1)}`,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            height: '40px', // Consistent height
          },
        },
      },
    },
    shape: {
      borderRadius: 12,
    },
  });
};

export default getTheme 
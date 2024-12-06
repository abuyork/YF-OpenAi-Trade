import { createTheme, Theme, alpha } from '@mui/material/styles'

export const getTheme = (isDarkMode: boolean): Theme => {
  const mainColor = '#3B82F6';
  const secondaryColor = '#10B981';
  const accentColor = '#6366F1';
  
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: mainColor,
        light: alpha(mainColor, 0.8),
        dark: alpha(mainColor, 1.2),
      },
      secondary: {
        main: secondaryColor,
        light: alpha(secondaryColor, 0.8),
        dark: alpha(secondaryColor, 1.2),
      },
      background: {
        default: isDarkMode ? '#111827' : '#F3F4F6',
        paper: isDarkMode ? '#1F2937' : '#FFFFFF',
      },
      text: {
        primary: isDarkMode ? '#F9FAFB' : '#1F2937',
        secondary: isDarkMode ? '#D1D5DB' : '#4B5563',
      },
    },
    typography: {
      fontFamily: "'Inter', 'system-ui', '-apple-system', sans-serif",
      h1: {
        fontSize: '3.5rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        background: `linear-gradient(135deg, ${mainColor}, ${accentColor})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.02em',
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '24px',
            backdropFilter: 'blur(20px)',
            backgroundColor: isDarkMode 
              ? alpha('#1F2937', 0.8)
              : alpha('#FFFFFF', 0.8),
            boxShadow: isDarkMode
              ? `0 8px 32px ${alpha('#000000', 0.4)}`
              : `0 8px 32px ${alpha('#000000', 0.1)}`,
            border: `1px solid ${isDarkMode 
              ? alpha('#FFFFFF', 0.05)
              : alpha('#000000', 0.05)}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            textTransform: 'none',
            padding: '12px 24px',
            fontSize: '0.95rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          },
          contained: {
            background: `linear-gradient(135deg, ${mainColor}, ${accentColor})`,
            color: '#FFFFFF',
            boxShadow: `0 4px 16px ${alpha(mainColor, 0.4)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${mainColor}, ${accentColor})`,
              boxShadow: `0 8px 24px ${alpha(mainColor, 0.6)}`,
            },
          },
          text: {
            color: 'inherit',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(20px)',
            backgroundColor: isDarkMode 
              ? alpha('#111827', 0.8)
              : alpha('#FFFFFF', 0.95),
            borderBottom: `1px solid ${isDarkMode 
              ? alpha('#FFFFFF', 0.05)
              : alpha('#000000', 0.05)}`,
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: alpha(mainColor, 0.1),
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: 'inherit',
          },
        },
      },
    },
  });

  return theme;
}

export default getTheme 
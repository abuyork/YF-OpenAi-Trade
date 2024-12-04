import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h6: {
      fontWeight: 600,
    },
    subtitle2: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          fontSize: '0.95rem',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(33, 150, 243, 0.3)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
            transform: 'translateY(0)',
          },
          '&.Mui-disabled': {
            background: '#e0e0e0',
          },
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
            color: '#ffffff',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 8px rgba(25, 118, 210, 0.15)',
            },
          },
        },
      },
    },
  },
})

export default theme 
import { 
  AppBar, Toolbar, Typography, Button, IconButton, Box, 
  useTheme, Container, alpha
} from '@mui/material';
import { Logo } from './Logo';
import { 
  BiMoon, BiSun, BiHomeAlt2, 
  BiInfoCircle, BiSupport, BiUser 
} from 'react-icons/bi';

interface HeaderProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export function Header({ toggleTheme, isDarkMode }: HeaderProps) {
  const theme = useTheme();

  return (
    <AppBar position="fixed" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexGrow: 1,
            gap: 1
          }}>
            <Logo />
            <Typography 
              variant="h6" 
              sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700
              }}
            >
              Trazel.io
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            alignItems: 'center'
          }}>
            <Button 
              color="inherit" 
              startIcon={<BiHomeAlt2 size={20} />}
              sx={{ 
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: theme.palette.primary.main,
                }
              }}
            >
              Home
            </Button>
            
            <Button 
              color="inherit" 
              startIcon={<BiInfoCircle size={20} />}
              sx={{ 
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: theme.palette.primary.main,
                }
              }}
            >
              About
            </Button>
            
            <Button 
              color="inherit" 
              startIcon={<BiSupport size={20} />}
              sx={{ 
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: theme.palette.primary.main,
                }
              }}
            >
              Support
            </Button>

            <IconButton 
              onClick={toggleTheme} 
              sx={{ 
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              {isDarkMode ? <BiSun size={24} /> : <BiMoon size={24} />}
            </IconButton>

            <Button
              variant="contained"
              startIcon={<BiUser size={20} />}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: '#FFFFFF',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
                }
              }}
            >
              Login
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
} 
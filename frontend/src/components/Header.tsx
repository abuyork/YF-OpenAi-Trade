import { 
  AppBar, Toolbar, Button, IconButton, Box, 
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
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        backdropFilter: 'blur(8px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ py: 1, gap: 2 }}>
          <Logo />
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            alignItems: 'center'
          }}>
            <Button 
              color="inherit" 
              startIcon={<BiHomeAlt2 />}
              sx={{ fontWeight: 500 }}
            >
              Home
            </Button>
            
            <Button 
              color="inherit" 
              startIcon={<BiInfoCircle />}
              sx={{ fontWeight: 500 }}
            >
              About
            </Button>
            
            <Button 
              color="inherit" 
              startIcon={<BiSupport />}
              sx={{ fontWeight: 500 }}
            >
              Support
            </Button>

            <IconButton 
              onClick={toggleTheme}
              sx={{ 
                color: theme.palette.text.primary,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              {isDarkMode ? <BiSun /> : <BiMoon />}
            </IconButton>

            <Button
              variant="contained"
              startIcon={<BiUser />}
              sx={{
                minWidth: '100px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
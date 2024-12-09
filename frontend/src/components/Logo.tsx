import { BiLineChart } from 'react-icons/bi';
import { Box, Typography, useTheme } from '@mui/material';

export function Logo() {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      gap: 1,
    }}>
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        padding: '8px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <BiLineChart 
          size={24} 
          style={{ 
            transform: 'rotate(-15deg)',
            color: '#FFFFFF',
          }} 
        />
      </Box>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Trazel.io
      </Typography>
    </Box>
  );
} 
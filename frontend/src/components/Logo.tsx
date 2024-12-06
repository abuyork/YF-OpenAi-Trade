import { BiLineChart } from 'react-icons/bi';
import { Box } from '@mui/material';

export function Logo() {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      color: 'primary.main'
    }}>
      <BiLineChart 
        size={32} 
        style={{ 
          transform: 'rotate(-15deg)',
          marginRight: '8px'
        }} 
      />
    </Box>
  );
} 
import { Card, CardContent, Grid, Typography, Box } from '@mui/material';
import type { MarketData } from '../types/api';
import { 
  BiTrendingUp, BiTrendingDown 
} from 'react-icons/bi';

interface MarketDataCardProps {
  data: MarketData;
}

export function MarketDataCard({ data }: MarketDataCardProps) {
  const formatValue = (value: number | undefined, prefix = '', decimals = 2): string => {
    if (value === undefined || value === null) return 'N/A';
    return `${prefix}${value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  const isPositiveChange = data.quote.regularMarketChangePercent >= 0;

  return (
    <Card elevation={3}>
      <CardContent>
        <Grid container spacing={3}>
          {/* Price Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {data.quote.symbol} Price
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                ${formatValue(data.quote.regularMarketPrice)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {isPositiveChange ? (
                  <BiTrendingUp size={24} color="success" />
                ) : (
                  <BiTrendingDown size={24} color="error" />
                )}
                <Typography
                  variant="body1"
                  sx={{
                    color: isPositiveChange ? 'success.main' : 'error.main',
                    ml: 1,
                  }}
                >
                  {formatValue(data.quote.regularMarketChangePercent)}%
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Market Data */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Today's Trading
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DataPoint
                label="Open"
                value={formatValue(data.quote.regularMarketOpen, '$')}
              />
              <DataPoint
                label="High"
                value={formatValue(data.quote.regularMarketDayHigh, '$')}
              />
              <DataPoint
                label="Low"
                value={formatValue(data.quote.regularMarketDayLow, '$')}
              />
              <DataPoint
                label="Volume"
                value={formatValue(data.quote.regularMarketVolume)}
              />
            </Box>
          </Grid>

          {/* Additional Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Key Statistics
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DataPoint
                label="52 Week High"
                value={formatValue(data.quote.fiftyTwoWeekHigh, '$')}
              />
              <DataPoint
                label="52 Week Low"
                value={formatValue(data.quote.fiftyTwoWeekLow, '$')}
              />
              <DataPoint
                label="Market Cap"
                value={formatValue(data.quote.marketCap, '$')}
              />
              <DataPoint
                label="P/E Ratio"
                value={formatValue(data.quote.trailingPE)}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  );
} 
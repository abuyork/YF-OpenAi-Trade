import React, { useState } from 'react';
import { Container, TextField, Button, Paper, Typography, Box, CircularProgress, Grid } from '@mui/material';
import axios from 'axios';
import './App.css';

function App() {
  const [symbol, setSymbol] = useState('');
  const [marketData, setMarketData] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to format large numbers
  const formatNumber = (num) => {
    if (!num) return 'N/A';
    if (typeof num === 'object') return `${num.low} - ${num.high}`;
    
    if (num >= 1000000000000) {
      return `${(num / 1000000000000).toFixed(2)}T`;
    } else if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    return num.toLocaleString();
  };

  const analyzeMarket = async () => {
    try {
      setLoading(true);
      setError('');
      setMarketData(null);
      setAnalysis('');
      
      // Get market data
      const marketDataResponse = await axios.get(`http://localhost:5000/api/market-data/${symbol}`);
      setMarketData(marketDataResponse.data);
      
      // Get AI analysis
      const analysisResponse = await axios.post('http://localhost:5000/api/analyze', {
        marketData: marketDataResponse.data
      });
      
      setAnalysis(analysisResponse.data.analysis);
    } catch (error) {
      console.error('Error:', error);
      setError('Error fetching market data. Please check the symbol and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Stock & Forex Market Analyzer
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <TextField
            fullWidth
            label="Enter Stock/Forex Symbol (e.g., AAPL, EURUSD=X)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            margin="normal"
          />
          
          <Button
            variant="contained"
            onClick={analyzeMarket}
            disabled={loading || !symbol}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze'}
          </Button>
        </Paper>

        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#ffebee' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {marketData && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Market Data: {marketData.quote.symbol}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  Current Price: ${marketData.quote.regularMarketPrice?.toFixed(2) || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  Previous Close: ${marketData.quote.regularMarketPreviousClose?.toFixed(2) || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  Day Range: ${marketData.quote.regularMarketDayLow?.toFixed(2) || 'N/A'} - ${marketData.quote.regularMarketDayHigh?.toFixed(2) || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  Volume: {formatNumber(marketData.quote.regularMarketVolume)}
                </Typography>
                <Typography variant="body2">
                  52 Week Range: ${marketData.quote.fiftyTwoWeekLow?.toFixed(2) || 'N/A'} - ${marketData.quote.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  Market Cap: {formatNumber(marketData.quote.marketCap)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {analysis && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Results
            </Typography>
            <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {analysis}
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default App;

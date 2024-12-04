import { useState } from 'react'
import { Container, TextField, Button, Paper, Typography, Box, CircularProgress, Grid } from '@mui/material'
import axios, { AxiosError } from 'axios'
import type { MarketData, AnalysisResponse, APIError } from './types/api'
import './App.css'

function App() {
  const [symbol, setSymbol] = useState('')
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatNumber = (num: number | undefined): string => {
    if (!num) return 'N/A'
    
    if (num >= 1000000000000) {
      return `${(num / 1000000000000).toFixed(2)}T`
    } else if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    }
    return num.toLocaleString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!symbol.trim()) return

    setLoading(true)
    setError('')
    setMarketData(null)
    setAnalysis('')
    
    try {
      const marketResponse = await axios.get<MarketData>(`/api/market-data/${symbol.toUpperCase()}`)
      if (marketResponse.data.error) {
        throw new Error(marketResponse.data.message)
      }
      setMarketData(marketResponse.data)

      const analysisResponse = await axios.get<AnalysisResponse>(`/api/analysis/${symbol.toUpperCase()}`)
      if (analysisResponse.data.error) {
        throw new Error(analysisResponse.data.message)
      }
      setAnalysis(analysisResponse.data.analysis)
    } catch (err) {
      console.error('API Error:', err)
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<APIError>
        if (axiosError.response?.data) {
          setError(axiosError.response.data.message)
        } else if (axiosError.request) {
          setError('No response from server. Please try again.')
        } else {
          setError(axiosError.message)
        }
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <TextField
          fullWidth
          label="Stock Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          margin="normal"
          error={!!error}
          helperText={error || 'Enter a stock symbol (e.g., AAPL, EURUSD=X)'}
          disabled={loading}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || !symbol.trim()}
          sx={{ mt: 2 }}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Paper sx={{ mt: 4, p: 2, bgcolor: 'error.light' }}>
          <Typography color="error.contrastText">
            {error}
          </Typography>
        </Paper>
      )}

      {marketData && (
        <Paper sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Market Data for {marketData.quote.symbol}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>Current Price: ${formatNumber(marketData.quote.regularMarketPrice)}</Typography>
              <Typography>Previous Close: ${formatNumber(marketData.quote.regularMarketPreviousClose)}</Typography>
              <Typography>Day Range: ${formatNumber(marketData.quote.regularMarketDayLow)} - ${formatNumber(marketData.quote.regularMarketDayHigh)}</Typography>
              <Typography>Volume: {formatNumber(marketData.quote.regularMarketVolume)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>52 Week Range: ${formatNumber(marketData.quote.fiftyTwoWeekLow)} - ${formatNumber(marketData.quote.fiftyTwoWeekHigh)}</Typography>
              <Typography>Market Cap: ${formatNumber(marketData.quote.marketCap)}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {analysis && (
        <Paper sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Analysis
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-line' }}>{analysis}</Typography>
        </Paper>
      )}
    </Container>
  )
}

export default App

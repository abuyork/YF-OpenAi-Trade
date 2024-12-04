import { useState } from 'react'
import { 
  Container, Button, Typography, Box, 
  CircularProgress, Grid, AppBar, Toolbar, Card, CardContent,
  useTheme, useMediaQuery, Select, MenuItem, FormControl, 
  InputLabel, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, Alert, SelectChangeEvent
} from '@mui/material'
import { marketCategories } from './types/symbols'
import { 
  TrendingUp, ShowChart, Analytics,
  ExpandMore, 
  Assessment} from '@mui/icons-material'
import axios, { AxiosError } from 'axios'
import type { MarketData, APIError } from './types/api'
import React from 'react'
import TradingViewWidget from './components/TradingViewWidget'

interface AnalysisSection {
  title: string;
  content: string;
  icon: React.ReactNode;
}

function App() {
  const [symbol, setSymbol] = useState('')
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState(marketCategories[0].id)
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [analysisData, setAnalysisData] = useState<AnalysisSection[]>([]);

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

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

  const parseAnalysis = (text: string) => {
    const sections = text.split('[SECTION]').filter(Boolean);
    const parsedSections: AnalysisSection[] = [];
    
    for (let i = 0; i < sections.length; i += 2) {
      const title = sections[i].trim();
      const content = sections[i + 1]?.trim() || 'Analysis not available';
      
      const getIcon = (title: string) => {
        switch (title) {
          case 'Technical Summary':
            return <Analytics />;
          case 'Trading Signal':
            return <TrendingUp />;
          case 'Key Levels':
            return <ShowChart />;
          default:
            return <Assessment />;
        }
      };

      parsedSections.push({
        title,
        content,
        icon: getIcon(title)
      });
    }
    
    return parsedSections;
  };

  const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url);
        if (!response.data) {
          throw new Error('Empty response received');
        }
        return response;
      } catch (error) {
        lastError = error as Error;
        if (i === retries - 1) break;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw lastError || new Error('Failed after retry attempts');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) {
      setError('Please enter a valid symbol');
      return;
    }

    setLoading(true);
    setError('');
    setMarketData(null);
    setAnalysis('');
    setAnalysisData([]);
    
    try {
      const marketResponse = await fetchWithRetry(`/api/market-data/${symbol.toUpperCase()}`);
      if (!marketResponse?.data || marketResponse.data.error) {
        throw new Error(marketResponse?.data?.message || 'Failed to fetch market data');
      }
      setMarketData(marketResponse.data);

      const analysisResponse = await fetchWithRetry(`/api/analysis/${symbol.toUpperCase()}`);
      if (!analysisResponse?.data || analysisResponse.data.error) {
        throw new Error(analysisResponse?.data?.message || 'Failed to generate analysis');
      }
      
      const analysisText = analysisResponse.data.analysis;
      if (!analysisText) {
        throw new Error('No analysis data received');
      }
      
      setAnalysis(analysisText);
      setAnalysisData(parseAnalysis(analysisText));
    } catch (err) {
      console.error('API Error:', err);
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<APIError>;
        setError(
          axiosError.response?.data?.message || 
          axiosError.message ||
          'Unable to fetch data. Please try again later.'
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      
      setMarketData(null);
      setAnalysis('');
      setAnalysisData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCategory(newValue);
    setSelectedSymbol('');
  };

  const handleSymbolChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedSymbol(value);
    setSymbol(value);
  };

  const formatDisplaySymbol = (symbol: string) => {
    return symbol.replace('=X', '');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ 
        backgroundColor: '#1976d2', 
        backgroundImage: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
        marginBottom: 4 
      }}>
        <Toolbar>
          <ShowChart sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Trazel AI
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {error && (
            <Grid item xs={12}>
              <Alert 
                severity="error" 
                onClose={() => setError('')}
                sx={{ mb: 2 }}
              >
                {error}
              </Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <TradingViewWidget symbol={selectedSymbol || 'AAPL'} />
          </Grid>

          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs 
                    value={category} 
                    onChange={handleCategoryChange}
                    variant="fullWidth"
                    sx={{
                      '& .MuiTab-root': {
                        fontSize: '1rem',
                        fontWeight: 500,
                        textTransform: 'none',
                      },
                      '& .Mui-selected': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {marketCategories.map((cat) => (
                      <Tab 
                        key={cat.id}
                        label={cat.name} 
                        value={cat.id}
                        icon={
                          cat.id === 'stocks' ? <ShowChart /> : 
                          cat.id === 'forex' ? <TrendingUp /> : 
                          <Analytics />
                        }
                        iconPosition="start"
                      />
                    ))}
                  </Tabs>
                </Box>

                <Box component="form" onSubmit={handleSubmit} 
                  sx={{ 
                    display: 'flex', 
                    gap: 2,
                    flexDirection: isMobile ? 'column' : 'row'
                  }}>
                  <FormControl fullWidth>
                    <InputLabel id="symbol-select-label">Select {marketCategories.find(c => c.id === category)?.name} Symbol</InputLabel>
                    <Select
                      labelId="symbol-select-label"
                      value={selectedSymbol}
                      onChange={handleSymbolChange}
                      label={`Select ${marketCategories.find(c => c.id === category)?.name} Symbol`}
                      disabled={loading}
                      sx={{
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: error ? 'error.main' : undefined,
                        },
                      }}
                    >
                      {marketCategories
                        .find(c => c.id === category)
                        ?.symbols.map((sym) => (
                          <MenuItem key={sym.symbol} value={sym.symbol}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <Typography>
                                {category === 'forex' ? sym.symbol.replace('=X', '') : sym.symbol}
                              </Typography>
                              <Typography color="text.secondary">{sym.name}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !selectedSymbol}
                    sx={{ 
                      minWidth: isMobile ? '100%' : '180px',
                      height: isMobile ? '48px' : '56px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out',
                      },
                      '&:hover::before': {
                        opacity: 1,
                      },
                      '&.Mui-disabled': {
                        background: '#e0e0e0',
                        color: 'rgba(0, 0, 0, 0.26)',
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Analytics sx={{ fontSize: '20px' }} />
                        Analyze
                      </>
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {marketData && (
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      Market Data: {formatDisplaySymbol(marketData.quote.symbol)}
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DataPoint 
                        label="Current Price" 
                        value={`$${formatNumber(marketData.quote.regularMarketPrice)}`}
                      />
                      <DataPoint 
                        label="Previous Close" 
                        value={`$${formatNumber(marketData.quote.regularMarketPreviousClose)}`}
                      />
                      <DataPoint 
                        label="Day Range" 
                        value={`$${formatNumber(marketData.quote.regularMarketDayLow)} - $${formatNumber(marketData.quote.regularMarketDayHigh)}`}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DataPoint 
                        label="Volume" 
                        value={formatNumber(marketData.quote.regularMarketVolume)}
                      />
                      <DataPoint 
                        label="52 Week Range" 
                        value={`$${formatNumber(marketData.quote.fiftyTwoWeekLow)} - $${formatNumber(marketData.quote.fiftyTwoWeekHigh)}`}
                      />
                      <DataPoint 
                        label="Market Cap" 
                        value={`$${formatNumber(marketData.quote.marketCap)}`}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {analysis && (
            <Grid item xs={12} md={marketData ? 6 : 12}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Analytics sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">AI Analysis</Typography>
                  </Box>
                  
                  {analysisData.map((section, index) => (
                    <Accordion 
                      key={section.title}
                      defaultExpanded={index === 0}
                      sx={{ 
                        mb: index < analysisData.length - 1 ? 1 : 0,
                        boxShadow: 'none',
                        '&:before': { display: 'none' }
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{ 
                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          borderRadius: '8px',
                          '&.Mui-expanded': { 
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {React.cloneElement(section.icon as React.ReactElement, { 
                            sx: { mr: 1, color: 'primary.main' }
                          })}
                          <Typography variant="subtitle1" fontWeight={500}>
                            {section.title}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            lineHeight: 1.7,
                            whiteSpace: 'pre-line'
                          }}
                        >
                          {section.content}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  )
}

// Helper component for displaying data points
function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  )
}

export default App

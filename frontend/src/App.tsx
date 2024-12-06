import { useState } from 'react'
import { 
  Container, Button, Box, 
  CircularProgress, Grid,
  Select, MenuItem, FormControl, 
  Alert, SelectChangeEvent
} from '@mui/material'
import { marketCategories } from './types/symbols'
import { 
  BiLineChart, BiAnalyse, BiBarChartAlt2,
  BiStats 
} from 'react-icons/bi';
import axios, { AxiosError } from 'axios'
import type { MarketData, APIError } from './types/api'
import React from 'react'
import TradingViewWidget from './components/TradingViewWidget'
import { Header } from './components/Header'
import { MarketDataCard } from './components/MarketDataCard'
import { AnalysisCard } from './components/AnalysisCard'

interface AnalysisSection {
  title: string;
  content: string;
  icon: React.ReactNode;
}

interface AppProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

function App({ isDarkMode, toggleTheme }: AppProps) {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState(marketCategories[0].id)
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
  const [analysisData, setAnalysisData] = useState<AnalysisSection[]>([])
  const [activeTab, setActiveTab] = useState(0)

  const parseAnalysis = (text: string) => {
    const sections = text.split('[SECTION]').filter(Boolean);
    const parsedSections: AnalysisSection[] = [];
    
    for (let i = 0; i < sections.length; i += 2) {
      const title = sections[i].trim();
      const content = sections[i + 1]?.trim() || 'Analysis not available';
      
      const getIcon = (title: string) => {
        switch (title) {
          case 'Technical Summary':
            return <BiAnalyse size={24} />;
          case 'Trading Signal':
            return <BiLineChart size={24} />;
          case 'Key Levels':
            return <BiBarChartAlt2 size={24} />;
          default:
            return <BiStats size={24} />;
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


  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategory(event.target.value);
    setSelectedSymbol('');
  };

  const handleSymbolChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedSymbol(value);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAnalyze = async () => {
    if (!selectedSymbol) {
      setError('Please select a symbol');
      return;
    }

    setLoading(true);
    setError('');
    setMarketData(null);
    setAnalysisData([]);
    
    try {
      const marketResponse = await fetchWithRetry(`/api/market-data/${selectedSymbol}`);
      if (!marketResponse?.data || marketResponse.data.error) {
        throw new Error(marketResponse?.data?.message || 'Failed to fetch market data');
      }
      setMarketData(marketResponse.data);

      const analysisResponse = await fetchWithRetry(`/api/analysis/${selectedSymbol}`);
      if (!analysisResponse?.data || analysisResponse.data.error) {
        throw new Error(analysisResponse?.data?.message || 'Failed to generate analysis');
      }
      
      const analysisText = analysisResponse.data.analysis;
      if (!analysisText) {
        throw new Error('No analysis data received');
      }
      
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: 'background.default',
      color: 'text.primary',
      pt: '64px'
    }}>
      <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <Select
                value={category}
                onChange={handleCategoryChange}
                displayEmpty
              >
                {marketCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <Select
                value={selectedSymbol}
                onChange={handleSymbolChange}
                displayEmpty
                disabled={!category}
              >
                {marketCategories
                  .find(cat => cat.id === category)
                  ?.symbols.map((sym) => (
                    <MenuItem key={sym.symbol} value={sym.symbol}>
                      {sym.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAnalyze}
              disabled={!selectedSymbol || loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                  Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ width: '100%', height: '600px' }}>
              <TradingViewWidget symbol={selectedSymbol} isDarkMode={isDarkMode} />
            </Box>
          </Grid>
          
          {marketData && (
            <>
              <Grid item xs={12}>
                <MarketDataCard data={marketData} />
              </Grid>
              {analysisData.length > 0 && (
                <Grid item xs={12}>
                  <AnalysisCard 
                    analysisData={analysisData}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                  />
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Container>
    </Box>
  )
}

export default App

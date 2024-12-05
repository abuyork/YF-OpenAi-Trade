const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const yahooFinance = require('yahoo-finance2').default;
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

const yahooFinanceOptions = {
  timeout: 10000,
  retry: {
    maxRetries: 3,
    backoff: 1000
  },
  validateResult: (result) => {
    return result !== undefined;
  },
  queue: {
    concurrency: 1,
    interval: 1000
  }
};

async function generateAnalysis(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `You are a professional technical analyst specializing in multi-timeframe profitable trading strategies. 
Analyze markets using the following frameworks for three different trading styles:

SCALPING (5-15min timeframe):
1. Price Action (1min and 5min charts)
2. Support/Resistance Levels
3. Volume Analysis
4. Risk:Reward 1:3 or 1:2 minimum
5. Tight Stop Loss

DAY TRADING (1H-4H timeframe):
1. Trend Direction (EMA 20, 50)
2. Support/Resistance
3. Volume Confirmation
4. Risk:Reward 1:3 or 1:2 minimum
5. Intraday Levels

SWING TRADING (Daily/Weekly):
1. Major Trend (200 EMA)
2. Key Support/Resistance
3. Volume Analysis
4. Risk:Reward 1:3 or 1:2 minimum
5. Multiple Day Holds

Format your analysis with clear [SECTION] markers for each trading style and provide specific entry/exit levels.`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(`Analysis generation failed: ${error.message}`);
  }
}

async function getYahooFinanceData(symbol) {
  try {
    let attempts = 0;
    const maxAttempts = 3;
    let error;

    while (attempts < maxAttempts) {
      try {
        const quote = await yahooFinance.quote(symbol, yahooFinanceOptions);
        return quote;
      } catch (err) {
        error = err;
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
        }
      }
    }
    throw error;
  } catch (error) {
    console.error('Yahoo Finance Error:', error);
    throw new Error(`Failed to fetch data for ${symbol}: ${error.message}`);
  }
}

app.get('/api/market-data/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('Fetching data for symbol:', symbol);
    
    const rawQuote = await getYahooFinanceData(symbol);
    
    if (!rawQuote) {
      return res.status(404).json({
        error: true,
        message: 'Symbol not found or data unavailable'
      });
    }

    const quote = {
      symbol: rawQuote.symbol,
      regularMarketPrice: rawQuote.regularMarketPrice || 0,
      regularMarketOpen: rawQuote.regularMarketOpen || 0,
      regularMarketDayHigh: rawQuote.regularMarketDayHigh || 0,
      regularMarketDayLow: rawQuote.regularMarketDayLow || 0,
      regularMarketPreviousClose: rawQuote.regularMarketPreviousClose || 0,
      regularMarketVolume: rawQuote.regularMarketVolume || 0,
      
      fiftyTwoWeekLow: rawQuote.fiftyTwoWeekLow || 0,
      fiftyTwoWeekHigh: rawQuote.fiftyTwoWeekHigh || 0,
      fiftyDayAverage: rawQuote.fiftyDayAverage || 0,
      twoHundredDayAverage: rawQuote.twoHundredDayAverage || 0,
      
      marketCap: rawQuote.marketCap || 0,
      trailingPE: rawQuote.trailingPE || 0,
      priceToBook: rawQuote.priceToBook || 0,
      dividendYield: rawQuote.dividendYield || 0,
      
      regularMarketChange: rawQuote.regularMarketChange || 0,
      regularMarketChangePercent: rawQuote.regularMarketChangePercent || 0,
    };

    if (rawQuote.historical && Array.isArray(rawQuote.historical)) {
      quote.historical = rawQuote.historical.map(day => ({
        date: day.date,
        open: day.open,
        high: day.high,
        low: day.low,
        close: day.close,
        volume: day.volume
      }));
    }

    res.json({ quote });
  } catch (error) {
    console.error('Market Data Error:', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch market data. Please try again later.'
    });
  }
});

// Add technical analysis helper functions
function calculateEMA(prices, period) {
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

function calculateMultipleEMAs(historical) {
  if (!historical || historical.length < 200) {
    return { ema200: null, ema50: null, ema20: null };
  }

  const closePrices = historical.map(candle => candle.close);
  
  // Calculate EMAs for different periods
  const ema200Data = closePrices.slice(-200);
  const ema50Data = closePrices.slice(-50);
  const ema20Data = closePrices.slice(-20);
  
  return {
    ema200: calculateEMA(ema200Data, 200),
    ema50: calculateEMA(ema50Data, 50),
    ema20: calculateEMA(ema20Data, 20)
  };
}

function analyzeVolume(historical) {
  if (!historical || historical.length < 20) {
    return { avgVolume: 0, volumeRatio: 0, volumeTrend: 'NEUTRAL' };
  }

  const recentVolumes = historical.slice(-20).map(candle => candle.volume);
  const avgVolume = recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length;
  
  // Get current volume (most recent)
  const currentVolume = historical[historical.length - 1].volume;
  const volumeRatio = currentVolume / avgVolume;
  
  // Analyze volume trend
  const volumeTrend = volumeRatio >= 1.5 ? 'HIGH' : 
                      volumeRatio <= 0.5 ? 'LOW' : 'NORMAL';
  
  return {
    avgVolume,
    volumeRatio,
    volumeTrend
  };
}

// Add this new function to handle forex-specific volume analysis
function analyzeForexActivity(historical, symbol) {
  if (!historical || historical.length < 20) {
    return { 
      activityLevel: 'NEUTRAL',
      priceChange: 0,
      volatility: 0,
      trend: 'NEUTRAL'
    };
  }

  // Get recent price data
  const recentData = historical.slice(-20);
  
  // Calculate price volatility (High-Low range)
  const volatility = recentData.map(candle => 
    Math.abs(candle.high - candle.low)
  ).reduce((sum, range) => sum + range, 0) / 20;

  // Calculate price movement (absolute change)
  const priceChanges = recentData.map(candle => 
    Math.abs(candle.close - candle.open)
  );
  
  const avgPriceChange = priceChanges.reduce((sum, change) => sum + change, 0) / 20;
  const currentPriceChange = Math.abs(recentData[recentData.length - 1].close - 
                                    recentData[recentData.length - 1].open);

  // Activity ratio based on recent price changes
  const activityRatio = currentPriceChange / avgPriceChange;

  // Determine trend
  const startPrice = recentData[0].close;
  const endPrice = recentData[recentData.length - 1].close;
  const trendStrength = ((endPrice - startPrice) / startPrice) * 100;

  return {
    activityLevel: activityRatio >= 1.5 ? 'HIGH' : 
                   activityRatio <= 0.5 ? 'LOW' : 'NORMAL',
    priceChange: currentPriceChange,
    volatility,
    trend: trendStrength > 1 ? 'BULLISH' :
           trendStrength < -1 ? 'BEARISH' : 'NEUTRAL',
    activityRatio
  };
}

// Modify the analysis endpoint
app.get('/api/analysis/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('Generating analysis for symbol:', symbol);
    
    const isForex = symbol.includes('=X');
    
    // Fetch data for multiple timeframes
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365); // Get 1 year of data

    const quote = await yahooFinance.quote(symbol);
    const dailyData = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });
    
    if (!quote || !dailyData) {
      throw new Error('Unable to fetch market data');
    }

    // Calculate technical indicators
    const { ema200, ema50, ema20 } = calculateMultipleEMAs(dailyData);
    
    const activityAnalysis = isForex ? 
      analyzeForexActivity(dailyData, symbol) :
      analyzeVolume(dailyData);

    // Calculate price levels
    const prices = dailyData.map(candle => candle.close);
    const high52Week = Math.max(...prices);
    const low52Week = Math.min(...prices);
    const priceRange = high52Week - low52Week;
    
    const fibLevels = {
      level0: low52Week,
      level236: low52Week + (priceRange * 0.236),
      level382: low52Week + (priceRange * 0.382),
      level500: low52Week + (priceRange * 0.5),
      level618: low52Week + (priceRange * 0.618),
      level786: low52Week + (priceRange * 0.786),
      level100: high52Week
    };

    const displaySymbol = symbol.includes('=X') ? symbol.replace('=X', '') : symbol;
    
    const analysisPrompt = `Analyze this ${isForex ? 'forex pair' : 'market'} data for ${displaySymbol}:

PRICE DATA:
Current Price: $${quote.regularMarketPrice}
Previous Close: $${quote.regularMarketPreviousClose}
Day Range: $${quote.regularMarketDayLow} - $${quote.regularMarketDayHigh}
52-Week Range: $${low52Week.toFixed(5)} - $${high52Week.toFixed(5)}

TECHNICAL INDICATORS:
200 EMA: $${ema200?.toFixed(5) || 'N/A'}
50 EMA: $${ema50?.toFixed(5) || 'N/A'}
20 EMA: $${ema20?.toFixed(5) || 'N/A'}

${isForex ? `FOREX ACTIVITY ANALYSIS:
Market Activity: ${activityAnalysis.activityLevel}
Price Volatility: ${activityAnalysis.volatility.toFixed(5)}
Recent Trend: ${activityAnalysis.trend}
Activity Ratio: ${activityAnalysis.activityRatio.toFixed(2)}x` :
`VOLUME ANALYSIS:
Average Volume (20-day): ${formatNumber(activityAnalysis.avgVolume)}
Current Volume: ${formatNumber(quote.regularMarketVolume)}
Volume Ratio: ${activityAnalysis.volumeRatio.toFixed(2)}x
Volume Trend: ${activityAnalysis.volumeTrend}`}

KEY PRICE LEVELS:
Fibonacci Levels:
0% (Support): $${fibLevels.level0.toFixed(5)}
23.6%: $${fibLevels.level236.toFixed(5)}
38.2%: $${fibLevels.level382.toFixed(5)}
50.0%: $${fibLevels.level500.toFixed(5)}
61.8%: $${fibLevels.level618.toFixed(5)}
78.6%: $${fibLevels.level786.toFixed(5)}
100% (Resistance): $${fibLevels.level100.toFixed(5)}

Do Technical and Price Action Analysis,Check Major Fundamental News that may highly Impact the Market,
Then Provide three trading signals:

[SECTION]Scalping Signal[SECTION]
TIMEFRAME: 5-15min
SIGNAL: BUY/SELL/NEUTRAL
ENTRY: $X.XXXXX
STOP LOSS: $X.XXXXX
TAKE PROFIT: $X.XXXXX (1:2 minimum)
RATIONALE: (Key reasons for the signal(shortly))

[SECTION]Day Trading Signal[SECTION]
TIMEFRAME: 1H-4H
SIGNAL: BUY/SELL/NEUTRAL
ENTRY: $X.XXXXX
STOP LOSS: $X.XXXXX
TAKE PROFIT: $X.XXXXX (1:2 minimum)
RATIONALE: (Key reasons for the signal(shortly))

[SECTION]Swing Trading Signal[SECTION]
TIMEFRAME: Daily/Weekly
SIGNAL: BUY/SELL/NEUTRAL
ENTRY: $X.XXXXX
STOP LOSS: $X.XXXXX
TAKE PROFIT: $X.XXXXX (1:3 minimum)
RATIONALE: (Key reasons for the signal(shortly))

Base analysis on:
1. Multiple timeframe alignment
2. Price action and trend structure
3. ${isForex ? 'Market activity' : 'Volume'} confirmation
4. Support/Resistance levels
5. Risk:Reward ratios
${isForex ? '6. Current forex session activity' : ''}
7. Major Fundamental News that may highly Impact the Market

Provide specific levels and clear rationale for each timeframe.`;

    const analysis = await generateAnalysis(analysisPrompt);
    
    if (!analysis) {
      throw new Error('Failed to generate analysis');
    }

    res.json({ 
      analysis,
      technicalData: {
        ema200,
        ema20,
        activityAnalysis,
        fibonacciLevels: fibLevels,
        isForex
      }
    });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to generate analysis. Please try again later.'
    });
  }
});

// Helper function to format large numbers
function formatNumber(num) {
  if (!num) return 'N/A';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toString();
}

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
}); 
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
  }
};

async function generateAnalysis(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a professional financial analyst. Format your analysis with [SECTION] markers." 
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

app.get('/api/market-data/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('Fetching data for symbol:', symbol);
    
    // Get quote data
    const rawQuote = await yahooFinance.quote(symbol, yahooFinanceOptions);
    
    // Get historical data (1 year of daily data)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);
    
    const historicalData = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });

    if (!rawQuote) {
      return res.status(404).json({
        error: true,
        message: 'Symbol not found'
      });
    }
    
    const quote = {
      symbol: rawQuote.symbol,
      // Current market data
      regularMarketPrice: rawQuote.regularMarketPrice || 0,
      regularMarketOpen: rawQuote.regularMarketOpen || 0,
      regularMarketDayHigh: rawQuote.regularMarketDayHigh || 0,
      regularMarketDayLow: rawQuote.regularMarketDayLow || 0,
      regularMarketPreviousClose: rawQuote.regularMarketPreviousClose || 0,
      regularMarketVolume: rawQuote.regularMarketVolume || 0,
      
      // Price metrics
      fiftyTwoWeekLow: rawQuote.fiftyTwoWeekLow || 0,
      fiftyTwoWeekHigh: rawQuote.fiftyTwoWeekHigh || 0,
      fiftyDayAverage: rawQuote.fiftyDayAverage || 0,
      twoHundredDayAverage: rawQuote.twoHundredDayAverage || 0,
      
      // Company metrics
      marketCap: rawQuote.marketCap || 0,
      trailingPE: rawQuote.trailingPE || 0,
      priceToBook: rawQuote.priceToBook || 0,
      dividendYield: rawQuote.dividendYield || 0,
      
      // Change metrics
      regularMarketChange: rawQuote.regularMarketChange || 0,
      regularMarketChangePercent: rawQuote.regularMarketChangePercent || 0,
      
      // Historical OHLCV data
      historical: historicalData.map(day => ({
        date: day.date,
        open: day.open,
        high: day.high,
        low: day.low,
        close: day.close,
        volume: day.volume
      }))
    };

    res.json({ quote });
  } catch (error) {
    console.error('Yahoo Finance API Error:', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to fetch market data: ' + error.message
    });
  }
});

app.get('/api/analysis/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('Generating analysis for symbol:', symbol);
    
    const quote = await yahooFinance.quote(symbol, yahooFinanceOptions);
    
    // Format the symbol for display by removing =X for forex pairs
    const displaySymbol = symbol.includes('=X') ? symbol.replace('=X', '') : symbol;
    
    const analysisPrompt = `Please analyze this market data for ${displaySymbol}:

Current Price: $${quote.regularMarketPrice || 'N/A'}
Previous Close: $${quote.regularMarketPreviousClose || 'N/A'}
Day Range: $${quote.regularMarketDayLow || 'N/A'} - $${quote.regularMarketDayHigh || 'N/A'}
Volume: ${quote.regularMarketVolume || 'N/A'}
Market Cap: $${quote.marketCap || 'N/A'}

Please provide a detailed analysis in the following format:

[SECTION]Market Position[SECTION]
Analyze the current market position, including market cap and overall standing.

[SECTION]Price Trends[SECTION]
Analyze recent price movements, patterns, and potential future directions.

[SECTION]Key Statistics[SECTION]
Analyze key financial metrics and their implications for investors.

[SECTION]Volume Analysis[SECTION]
Analyze trading volume patterns and what they indicate about market activity.

[SECTION]Market Sentiment[SECTION]
Analyze overall market sentiment and investor perception.

[SECTION]Risks & Opportunities[SECTION]
Identify key risks and potential growth opportunities.

Keep each section concise but informative.`;

    const analysis = await generateAnalysis(analysisPrompt);
    
    if (!analysis) {
      throw new Error('Failed to generate analysis');
    }

    res.json({ analysis });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to generate analysis: ' + error.message
    });
  }
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
}); 
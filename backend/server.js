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
          content: "You are a professional technical analyst. Provide concise analysis and clear trading signals with risk/reward ratios. Format your analysis with [SECTION] markers." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
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

app.get('/api/analysis/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('Generating analysis for symbol:', symbol);
    
    const quote = await getYahooFinanceData(symbol);
    
    if (!quote) {
      throw new Error('Unable to fetch market data');
    }

    const displaySymbol = symbol.includes('=X') ? symbol.replace('=X', '') : symbol;
    
    const analysisPrompt = `Analyze this market data for ${displaySymbol}:

Current Price: $${quote.regularMarketPrice || 'N/A'}
Previous Close: $${quote.regularMarketPreviousClose || 'N/A'}
Day Range: $${quote.regularMarketDayLow || 'N/A'} - $${quote.regularMarketDayHigh || 'N/A'}
50-Day Average: $${quote.fiftyDayAverage || 'N/A'}
200-Day Average: $${quote.twoHundredDayAverage || 'N/A'}
Volume: ${quote.regularMarketVolume || 'N/A'}

Provide a brief technical analysis with the following sections:

[SECTION]Technical Summary[SECTION]
Give a 2-3 sentence technical overview focusing on key price levels and trends.

[SECTION]Trading Signal[SECTION]
SIGNAL: BUY/SELL/HOLD
ENTRY PRICE: $X.XXXXX
STOP LOSS: $X.XXXXX
TAKE PROFIT: $X.XXXXX
RISK/REWARD RATIO: X.XX
SIGNAL STRENGTH: Strong/Moderate/Weak

[SECTION]Key Levels[SECTION]
1. Resistance: $X.XXXXX
2. Support: $X.XXXXX
3. Key Price Level: $X.XXXXX (50-Day Average/200-Day Average/Previous High/etc)

Keep each section very concise and focused on actionable insights.`;

    const analysis = await generateAnalysis(analysisPrompt);
    
    if (!analysis) {
      throw new Error('Failed to generate analysis');
    }

    res.json({ analysis });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ 
      error: true,
      message: 'Failed to generate analysis. Please try again later.'
    });
  }
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
}); 
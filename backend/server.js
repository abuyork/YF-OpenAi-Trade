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
        { role: "system", content: "You are a professional financial analyst." },
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

app.get('/api/market-data/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('Fetching data for symbol:', symbol);
    
    const rawQuote = await yahooFinance.quote(symbol, yahooFinanceOptions);
    console.log('Raw quote data:', rawQuote);
    
    if (!rawQuote) {
      return res.status(404).json({
        error: true,
        message: 'Symbol not found'
      });
    }
    
    const quote = {
      symbol: rawQuote.symbol,
      regularMarketPrice: rawQuote.regularMarketPrice || 0,
      regularMarketPreviousClose: rawQuote.regularMarketPreviousClose || 0,
      regularMarketDayLow: rawQuote.regularMarketDayLow || 0,
      regularMarketDayHigh: rawQuote.regularMarketDayHigh || 0,
      regularMarketVolume: rawQuote.regularMarketVolume || 0,
      fiftyTwoWeekLow: rawQuote.fiftyTwoWeekLow || 0,
      fiftyTwoWeekHigh: rawQuote.fiftyTwoWeekHigh || 0,
      marketCap: rawQuote.marketCap || 0
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
    
    const analysisPrompt = `Please analyze this market data for ${symbol}:
    
    Current Price: $${quote.regularMarketPrice || 'N/A'}
    Previous Close: $${quote.regularMarketPreviousClose || 'N/A'}
    Day Range: $${quote.regularMarketDayLow || 'N/A'} - $${quote.regularMarketDayHigh || 'N/A'}
    Volume: ${quote.regularMarketVolume || 'N/A'}
    Market Cap: $${quote.marketCap || 'N/A'}
    
    Please provide a detailed analysis including:
    1. Current Market Position
    2. Price Trends
    3. Key Statistics Analysis
    4. Trading Volume Analysis
    5. Market Sentiment
    6. Potential Risks and Opportunities
    
    Keep the analysis concise but informative.`;

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
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const yahooFinance = require('yahoo-finance2').default;
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Enhanced market data fetching
app.get('/api/market-data/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Get quote data
    const quote = await yahooFinance.quote(symbol);
    
    // Get detailed stock/forex information
    const [quoteSummary, historicalData] = await Promise.all([
      yahooFinance.quoteSummary(symbol, {
        modules: ['price', 'summaryDetail', 'defaultKeyStatistics']
      }),
      yahooFinance.historical(symbol, {
        period1: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)), // Last 30 days
        period2: new Date(),
        interval: '1d'
      })
    ]);

    const marketData = {
      quote,
      summary: quoteSummary,
      historicalPrices: historicalData
    };

    res.json(marketData);
  } catch (error) {
    console.error('Yahoo Finance API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { marketData } = req.body;
    
    const systemPrompt = `You are a professional financial analyst. Analyze the provided market data and provide a detailed analysis including:
    1. Current Market Position
    2. Price Trends and Momentum
    3. Key Statistics Analysis
    4. Trading Volume Analysis
    5. Recent Price Movement Patterns
    6. Market Sentiment
    7. Potential Risks and Opportunities
    8. Short-term and Long-term Outlook
    
    Please provide specific numbers and percentages where relevant, and explain your reasoning clearly.`;

    const userPrompt = `Please analyze this market data for ${marketData.quote.symbol}:
    
    Current Price: ${marketData.quote.regularMarketPrice}
    Previous Close: ${marketData.quote.regularMarketPreviousClose}
    Day Range: ${marketData.quote.regularMarketDayRange}
    52-Week Range: ${marketData.quote.fiftyTwoWeekRange}
    Volume: ${marketData.quote.regularMarketVolume}
    Market Cap: ${marketData.quote.marketCap}
    
    Historical Price Trend (Last 30 Days): ${JSON.stringify(marketData.historicalPrices.slice(-5))}
    
    Additional Metrics:
    ${JSON.stringify(marketData.summary, null, 2)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    res.json({ analysis: completion.choices[0].message.content });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 
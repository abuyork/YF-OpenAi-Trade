import { useEffect, useRef, memo } from 'react';
import { Card, CardContent } from '@mui/material';

interface TradingViewWidgetProps {
  symbol?: string;
  isDarkMode?: boolean;
}

function TradingViewWidget({ symbol = 'AAPL', isDarkMode = false }: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const formatSymbol = (sym: string) => {
      const upperSym = sym.toUpperCase();
      
      if (upperSym.includes('=X')) {
        return `FX:${upperSym.replace('=X', '')}`;
      }
      
      if (upperSym.endsWith('-USD') || upperSym.endsWith('-USDT')) {
        const base = upperSym.split('-')[0];
        const quote = upperSym.split('-')[1];
        return `BINANCE:${base}${quote}`;
      }
      
      return sym;
    };

    const formattedSymbol = formatSymbol(symbol);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "width": "100%",
        "height": "600",
        "symbol": "${formattedSymbol}",
        "interval": "60",
        "timezone": "Etc/UTC",
        "theme": "${isDarkMode ? 'dark' : 'light'}",
        "style": "1",
        "locale": "en",
        "backgroundColor": "${isDarkMode ? 'rgba(19, 23, 34, 1)' : 'rgba(255, 255, 255, 1)'}",
        "gridColor": "${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}",
        "hide_legend": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "calendar": false,
        "hide_volume": true,
        "support_host": "https://www.tradingview.com",
        "enabled_features": ["legend_widget"],
        "disabled_features": [
          "header_widget",
          "left_toolbar",
          "volume_force_overlay"
        ]
      }`;

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, isDarkMode]);

  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent sx={{ 
        p: 0, 
        height: '100%', 
        '& .tradingview-widget-container': {
          height: '100%'
        },
        '& .tradingview-widget-container__widget': {
          height: '100%'
        }
      }}>
        <div className="tradingview-widget-container" ref={container}>
          <div className="tradingview-widget-container__widget"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(TradingViewWidget); 
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bitcoin, Gem, DollarSign, Wallet, TrendingUp, TrendingDown, Minus, Users, Zap, Waves, Coins, Layers, PawPrint, GraduationCap, Wine, Clock, Gift } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface CryptoItemProps {
  icon: React.ReactNode;
  symbol: string;
  symbolColor: string;
  price: string;
  priceColor?: string;
  change: string;
  changeColor?: string;
  trend: 'up' | 'down' | 'neutral';
}

const CryptoItem = ({ icon, symbol, symbolColor, price, priceColor = '#4ade80', change, changeColor, trend }: CryptoItemProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = changeColor || (trend === 'up' ? '#4ade80' : trend === 'down' ? '#f87171' : '#6b7280');
  
  return (
    <div className="flex items-center gap-2 px-4 shrink-0">
      <div className="text-[12px]" style={{ color: symbolColor }}>
        {icon}
      </div>
      <span className="font-bold text-[12px] font-mono" style={{ color: symbolColor }}>
        {symbol}
      </span>
      <div className="flex items-center gap-1 font-mono text-[12px]">
        <span style={{ color: priceColor }}>{price}</span>
        <TrendIcon size={10} color={trendColor} />
        <span style={{ color: trendColor }}>({change})</span>
      </div>
    </div>
  );
};

export function CryptoTicker() {
  const { t } = useLanguage();
  const [cryptoData, setCryptoData] = useState<CryptoItemProps[]>([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  // Promotion messages array
  const promotions = [
    {
      icon: <Users size={12} className="text-[#f7931a]" />,
      text: "Group Booking (5+): Complimentary Champagne Bottle"
    },
    {
      icon: <GraduationCap size={12} className="text-[#3b82f6]" />,
      text: "Student Discount: 10% OFF with valid Student ID"
    },
    {
      icon: <Wine size={12} className="text-[#ec4899]" />,
      text: "Free Drinks & Cocktails for all customers!"
    },
    {
      icon: <Clock size={12} className="text-[#10b981]" />,
      text: "Happy Hour: Mon-Thu (12PM - 3:30PM) - 15% OFF All Services"
    },
    {
      icon: <Gift size={12} className="text-[#f59e0b]" />,
      text: "Birthday Treat: Get 15% OFF during your birthday month"
    }
  ];

  // Rotate promotions every 4 seconds
  useEffect(() => {
    const promoInterval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promotions.length);
    }, 4000);
    
    return () => clearInterval(promoInterval);
  }, [promotions.length]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [coingeckoRes, vlinkRes] = await Promise.allSettled([
          fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,ripple,binancecoin,solana,cardano,binance-peg-dogecoin'),
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/proxy/vlink`, {
             headers: { Authorization: `Bearer ${publicAnonKey}` }
          })
        ]);

        let vlinkData: CryptoItemProps[] = [];
        
        // --- 1. Process VLinkExchange Data (VMM & VLG) ---
        if (vlinkRes.status === 'fulfilled') {
          try {
            const rawData = await vlinkRes.value.json();

            // Deep traverse function to find ANY object that looks like a market
            const findAllMarkets = (data: any): any[] => {
                const results: any[] = [];
                const seen = new Set(); // Avoid circular refs if any

                const traverse = (node: any) => {
                    if (!node || typeof node !== 'object' || seen.has(node)) return;
                    seen.add(node);
                    
                    if (Array.isArray(node)) {
                        node.forEach(item => traverse(item));
                        return;
                    }

                    // Check if this node is a market object
                    const hasSymbol = node.symbol || node.baseName || node.base_name || node.pair;
                    const hasPrice = node.price !== undefined || node.last_price !== undefined || node.changedPercent24 !== undefined;
                    
                    if (hasSymbol && hasPrice) {
                        results.push(node);
                    } else {
                        // If not a market, dig deeper into its values
                        Object.values(node).forEach(child => traverse(child));
                    }
                };
                
                traverse(data);
                return results;
            };

            const markets = findAllMarkets(rawData);
            
            if (markets.length > 0) {
                // Log the first few found markets to verify content
                // console.log('🔍 First 3 Markets Found:', markets.slice(0, 3));

                // Helpers for matching
                const normalize = (s: any) => (s || '').toString().toUpperCase().trim();
                
                // --- Find VMM ---
                const vmmMarket = markets.find((m: any) => {
                    const baseName = normalize(m.baseName || m.base_name);
                    const symbol = normalize(m.symbol || m.pair);
                    // Match VMM
                    return symbol.includes('VMM') || baseName.includes('VMM');
                });

                // --- Find VLG ---
                const vlgMarket = markets.find((m: any) => {
                    const baseName = normalize(m.baseName || m.base_name);
                    const symbol = normalize(m.symbol || m.pair);
                    // Match VLG
                    return symbol.includes('VLG') || baseName.includes('VLG');
                });

                const processVLinkItem = (market: any, displaySymbol: string, color: string, Icon: any): CryptoItemProps | null => {
                    if (!market) return null;

                    // Extract Price
                    const rawPrice = market.price ?? market.last_price ?? market.last ?? 0;
                    const priceVal = parseFloat(rawPrice);

                    // Extract Change
                    const rawChange = market.changedPercent24 ?? market.change_24h ?? market.price_change_percent ?? 0;
                    const changeVal = parseFloat(rawChange);

                    const isUp = changeVal >= 0;

                    return {
                        icon: <Icon size={12} />,
                        symbol: displaySymbol,
                        symbolColor: color,
                        price: `$${priceVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
                        priceColor: isUp ? '#4ade80' : (changeVal === 0 ? 'white' : '#f87171'),
                        change: (isUp ? '+' : '') + changeVal.toFixed(2) + '%',
                        changeColor: isUp ? '#4ade80' : (changeVal === 0 ? 'white' : '#f87171'),
                        trend: (changeVal === 0 ? 'neutral' : (isUp ? 'up' : 'down'))
                    };
                };

                const vmmItem = processVLinkItem(vmmMarket, 'VMM/USDT', '#8b5cf6', Wallet); // Purple
                const vlgItem = processVLinkItem(vlgMarket, 'VLG/USDT', '#ec4899', Zap);    // Pink

                if (vmmItem) vlinkData.push(vmmItem);
                if (vlgItem) vlinkData.push(vlgItem);
            }
          } catch (e) {
            console.error("❌ Error parsing VLink JSON:", e);
          }
        }

        // Fallback for VMM/VLG if API fails or items not found
        const hasVMM = vlinkData.some(d => d.symbol === 'VMM/USDT');
        const hasVLG = vlinkData.some(d => d.symbol === 'VLG/USDT');

        if (!hasVMM) {
             console.warn('⚠️ VMM not found in API data, using fallback');
             vlinkData.unshift({
                icon: <Wallet size={12} />,
                symbol: 'VMM/USDT',
                symbolColor: '#8b5cf6',
                price: '$0.1234',
                priceColor: '#4ade80',
                change: '+5.67%',
                changeColor: '#4ade80',
                trend: 'up'
            });
        }
        
        if (!hasVLG) {
             console.warn('⚠️ VLG not found in API data, using fallback');
             // Add after VMM
             const insertIdx = vlinkData.findIndex(d => d.symbol === 'VMM/USDT') + 1;
             vlinkData.splice(insertIdx, 0, {
                icon: <Zap size={12} />,
                symbol: 'VLG/USDT',
                symbolColor: '#ec4899',
                price: '$0.0876',
                priceColor: '#4ade80',
                change: '+3.21%',
                changeColor: '#4ade80',
                trend: 'up'
            });
        }

        // --- 2. Process CoinGecko Data ---
        let coingeckoItems: CryptoItemProps[] = [];
        if (coingeckoRes.status === 'fulfilled') {
            try {
                const data = await coingeckoRes.value.json();
                if (Array.isArray(data)) {
                    coingeckoItems = data.map((coin: any) => {
                        const isUp = coin.price_change_percentage_24h >= 0;
                        const changeVal = coin.price_change_percentage_24h != null 
                            ? Math.abs(coin.price_change_percentage_24h).toFixed(2) + '%'
                            : '0.00%';
                        
                        let icon = <DollarSign size={12} />;
                        let color = '#9ca3af';

                        switch(coin.id) {
                            case 'bitcoin': icon = <Bitcoin size={12} />; color = '#f7931a'; break;
                            case 'ethereum': icon = <Gem size={12} />; color = '#627eea'; break;
                            case 'ripple': icon = <Waves size={12} />; color = '#23292f'; break;
                            case 'binancecoin': icon = <Coins size={12} />; color = '#f3ba2f'; break;
                            case 'solana': icon = <Zap size={12} />; color = '#00FFA3'; break;
                            case 'cardano': icon = <Layers size={12} />; color = '#0033ad'; break;
                            case 'binance-peg-dogecoin': icon = <PawPrint size={12} />; color = '#C2A633'; break;
                        }

                        return {
                            icon,
                            symbol: `${coin.symbol.toUpperCase()}/USD`,
                            symbolColor: color,
                            price: `$${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
                            priceColor: isUp ? '#4ade80' : '#f87171',
                            change: (isUp ? '+' : '-') + changeVal,
                            changeColor: isUp ? '#4ade80' : '#f87171',
                            trend: (coin.price_change_percentage_24h === 0 ? 'neutral' : (isUp ? 'up' : 'down'))
                        };
                    });
                }
            } catch (e) {
                console.error("❌ Error parsing CoinGecko JSON:", e);
            }
        }

        // Combine: VMM, VLG, then others
        const finalData = [...vlinkData, ...coingeckoItems];
        setCryptoData(finalData);

      } catch (error) {
        console.error("❌ Fatal error in fetchPrices:", error);
      }
    };

    fetchPrices();
    // Refresh every 2 minutes (120,000ms) to avoid spamming
    const interval = setInterval(fetchPrices, 120000);
    return () => clearInterval(interval);
  }, []);

  if (cryptoData.length === 0) {
     return (
        <div className="w-full">
            <div className="h-8 bg-[#050505] border-b border-[#1f2937] flex items-center justify-center">
                <span className="text-xs text-gray-500 font-mono">Loading market data...</span>
            </div>
             {/* Notification Bar */}
            <div className="h-8 bg-black border-b border-[#1f2937] flex items-center justify-center relative z-10 px-4">
                <div className="flex items-center gap-2">
                {promotions[currentPromoIndex].icon}
                <span className="text-[10px] md:text-[12px] font-sans tracking-[1.2px] uppercase text-white truncate">
                    {promotions[currentPromoIndex].text}
                </span>
                </div>
            </div>
        </div>
     );
  }

  // Duplicate data for smooth marquee loop
  const marqueeItems = [...cryptoData, ...cryptoData, ...cryptoData, ...cryptoData];

  return (
    <div className="w-full">
      {/* Crypto Ticker Bar */}
      <div className="h-8 bg-[#050505] border-b border-[#1f2937] overflow-hidden flex items-center relative z-20">
        <div className="flex w-full overflow-hidden mask-linear-gradient">
          <motion.div
            className="flex items-center whitespace-nowrap"
            animate={{ x: ["0%", "-25%"] }} 
            transition={{
              duration: Math.max(20, cryptoData.length * 4),
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {marqueeItems.map((item, index) => (
              <CryptoItem key={`ticker-${index}`} {...item} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Notification Bar */}
      <div className="h-8 bg-black border-b border-[#1f2937] flex items-center justify-center relative z-10 px-4">
        <motion.div 
          key={currentPromoIndex}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          {promotions[currentPromoIndex].icon}
          <span className="text-[10px] md:text-[12px] font-sans tracking-[1.2px] uppercase text-white hover:text-[#f7931a] transition-colors duration-300 truncate cursor-pointer">
             {promotions[currentPromoIndex].text}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
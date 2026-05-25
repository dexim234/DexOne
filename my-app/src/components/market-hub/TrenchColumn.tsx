"use client";

import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { Rooms } from "@/types/websocket";
import { getWebSocketClient } from "@/lib/websocket-client";
import { WS_CONFIG } from "@/lib/ws-config";

interface PumpPortalToken {
  name: string;
  symbol: string;
  address: string;
  metadata_uri: string;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  real_sol_reserves: number;
  real_token_reserves: number;
  token_total_supply: number;
  complete: boolean;
  created_at: string;
}

interface TokenCardProps {
  token: PumpPortalToken;
}

function TokenCard({ token }: TokenCardProps) {
  const formattedAddress = `${token.address.slice(0, 4)}...${token.address.slice(-4)}`;
  const timeAgo = getTimeAgo(token.created_at);

  return (
    <div className="bg-muted/50 rounded-lg p-3 mb-2 hover:bg-muted transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
          {token.symbol.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm truncate">{token.symbol}</span>
            <span className="text-xs text-muted-foreground truncate">{token.name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formattedAddress}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>
        <button className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors">
          Buy
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = Date.now();
  const created = new Date(timestamp).getTime();
  const diff = Math.floor((now - created) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

interface TrenchColumnProps {
  title: string;
  icon: React.ReactNode;
  room?: Rooms;
}

export default function TrenchColumn({ title, icon, room }: TrenchColumnProps) {
  const [tokens, setTokens] = useState<PumpPortalToken[]>([]);

  useEffect(() => {
    // Подписываемся на все обновления токенов
    const handleAllTokens = (_receivedRoom: Rooms, newTokens: PumpPortalToken[]) => {
      setTokens((prev) => {
        const existingAddresses = new Set(prev.map((t) => t.address));
        const uniqueNew = newTokens.filter((t) => !existingAddresses.has(t.address));
        
        let filtered = [...uniqueNew, ...prev].slice(0, 50);

        // Фильтрация по типу колонки
        if (room === Rooms.NEW_PAIRS) {
          // New: последние 20 токенов
          filtered = filtered.slice(0, 20);
        } else if (room === Rooms.SOON) {
          // Soon: токены от 1 до 10 минут
          const now = Date.now();
          filtered = filtered.filter((t) => {
            const age = Math.floor((now - new Date(t.created_at).getTime()) / 1000);
            return age >= 60 && age < 600;
          });
        } else if (room === Rooms.RECENT) {
          // Recent/Migration: токены старше 10 минут
          const now = Date.now();
          filtered = filtered.filter((t) => {
            const age = Math.floor((now - new Date(t.created_at).getTime()) / 1000);
            return age >= 600;
          });
        }

        return filtered;
      });
    };

    const client = getWebSocketClient(WS_CONFIG.URL);
    client.connect();
    const unsubscribe = client.subscribe(Rooms.NEW_PAIRS, handleAllTokens);

    return () => {
      unsubscribe();
    };
  }, [room]);

  const renderTokens = () => {
    if (tokens.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {room === Rooms.NEW_PAIRS 
            ? "Ожидание новых токенов..." 
            : room === Rooms.SOON
            ? "Нет токенов 1-10 мин"
            : "Нет токенов >10 мин"}
        </div>
      );
    }

    return tokens.map((token) => (
      <TokenCard key={token.address} token={token} />
    ));
  };

  return (
    <div className="bg-card rounded-xl border p-4 flex flex-col h-[600px]">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-base">{title}</h3>
          {tokens.length > 0 && (
            <span className="bg-primary/20 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
              {tokens.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-accent rounded-lg transition-colors">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {renderTokens()}
      </div>
    </div>
  );
}

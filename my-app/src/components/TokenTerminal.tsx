'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Rooms } from '../types/websocket';
import { useTokenUpdates } from '../lib/useTokenUpdates';
import { PumpPortalToken, PumpPortalTrade } from '../lib/websocket-client';

interface TokenTerminalProps {
  rooms?: Rooms[];
  maxLines?: number;
}

export function TokenTerminal({ 
  rooms = [Rooms.NEW_PAIRS, Rooms.RECENT],
  maxLines = 100 
}: TokenTerminalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const terminalRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => {
      const newLogs = [...prev, `[${logIdRef.current++}] ${message}`];
      if (newLogs.length > maxLines) {
        return newLogs.slice(newLogs.length - maxLines);
      }
      return newLogs;
    });
  }, [maxLines]);

  const handleTokenUpdate = useCallback((room: Rooms, tokens: any[]) => {
    tokens.forEach((token) => {
      let logMessage = '';
      
      if (room === Rooms.NEW_PAIRS && 'address' in token) {
        // Новый токен от pumpportal.fun
        const t = token as PumpPortalToken;
        logMessage = `[NEW] ${t.symbol} (${t.name}) | CA: ${t.address.slice(0, 4)}...${t.address.slice(-4)} | Created: ${new Date(t.created_at).toLocaleTimeString()}`;
      } else if (room === Rooms.RECENT && 'event' in token) {
        // Сделка от pumpportal.fun
        const trade = token as PumpPortalTrade;
        const tradeIcon = trade.event === 'buy' ? '🟢' : '🔴';
        logMessage = `${tradeIcon} [TRADE] ${trade.symbol} | ${trade.event.toUpperCase()} | ${trade.amount_sol.toFixed(4)} SOL | $${trade.usd_sol_rate.toFixed(6)}`;
      } else {
        // Универсальный формат
        logMessage = `[${room}] ${JSON.stringify(token).slice(0, 100)}`;
      }
      
      addLog(logMessage);
    });
  }, [addLog]);

  const handleError = useCallback((error: Error) => {
    addLog(`[ERROR] ${error.message}`);
    setConnectionStatus('disconnected');
  }, [addLog]);

  // Подписываемся на все комнаты
  rooms.forEach((room) => {
    useTokenUpdates(room, {
      onTokenUpdate: handleTokenUpdate,
      onError: handleError,
    });
  });

  // Эмуляция статуса подключения через console
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('connecting');
      addLog('[WebSocket] Подключение к pumpportal.fun...');
    };
    
    const handleConnect = () => {
      setConnectionStatus('connected');
      addLog('[WebSocket] ✅ Подключено к pumpportal.fun');
      addLog('[WebSocket] Подписка на новые токены и сделки...');
    };
    
    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
      addLog('[WebSocket] ❌ Соединение потеряно');
    };

    // Слушаем события WebSocket через кастомные события
    window.addEventListener('ws-connected', handleConnect);
    window.addEventListener('ws-disconnected', handleDisconnect);
    window.addEventListener('ws-connecting', handleOnline);

    return () => {
      window.removeEventListener('ws-connected', handleConnect);
      window.removeEventListener('ws-disconnected', handleDisconnect);
      window.removeEventListener('ws-connecting', handleOnline);
    };
  }, [addLog]);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
    logIdRef.current = 0;
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢 Подключено';
      case 'connecting': return '🟡 Подключение...';
      default: return '🔴 Отключено';
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono text-sm rounded-lg border border-green-800">
      <div className="flex items-center justify-between px-4 py-2 bg-green-900/20 border-b border-green-800">
        <h2 className="font-bold">📡 PumpPortal Terminal</h2>
        <div className="flex items-center gap-3">
          <span className={getStatusColor()}>{getStatusText()}</span>
          <button
            onClick={clearLogs}
            className="px-3 py-1 bg-green-800 hover:bg-green-700 text-green-100 rounded text-xs transition-colors"
          >
            Очистить
          </button>
        </div>
      </div>
      
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {logs.length === 0 && (
          <div className="text-gray-500 italic">Ожидание данных...</div>
        )}
        {logs.map((log, index) => (
          <div key={index} className="whitespace-pre-wrap break-all">
            {log}
          </div>
        ))}
      </div>

      <div className="px-4 py-2 bg-green-900/20 border-t border-green-800 text-xs text-gray-400">
        Комнаты: {rooms.join(', ')} | Записей: {logs.length}
      </div>
    </div>
  );
}

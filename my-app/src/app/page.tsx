'use client';

import { TokenTerminal } from '@/components/TokenTerminal';
import { Rooms } from '@/types/websocket';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          🚀 Pump.fun Монитор в реальном времени
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Терминал с токенами */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              🔴 Live Terminal
            </h2>
            <TokenTerminal 
              rooms={[
                Rooms.NEW_PAIRS,  // Новые токены
                Rooms.RECENT,     // Сделки
              ]}
              maxLines={150}
            />
          </div>

          {/* Статус подключений */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              📊 Информация
            </h2>
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-green-400 mb-2">Подключение:</h3>
                <p className="text-gray-300 text-sm">
                  <code className="bg-gray-700 px-2 py-1 rounded">wss://pumpportal.fun/api/data</code>
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-green-400 mb-2">Комнаты подписки:</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>• <span className="text-blue-400">NEW_PAIRS</span> - Новые токены на pump.fun</li>
                  <li>• <span className="text-orange-400">RECENT</span> - Сделки (buy/sell)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-green-400 mb-2">Как это работает:</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                  <li>Клиент подключается к PumpPortal WebSocket</li>
                  <li>Подписывается на события новых токенов</li>
                  <li>Получает сделки в реальном времени</li>
                  <li>Терминал отображает всё мгновенно</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <h3 className="font-semibold text-green-400 mb-2">Примеры событий:</h3>
                <div className="text-xs text-gray-400 space-y-1 font-mono">
                  <p>[NEW] PEPE (Pepe Coin) | CA: 9xQe...vLs1</p>
                  <p>🟢 [TRADE] SOLBOM | BUY | 1.5 SOL | $0.000123</p>
                  <p>🔴 [TRADE] BOME | SELL | 0.8 SOL | $0.004567</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Данные с PumpPortal.fun — без API ключа для базовой подписки
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

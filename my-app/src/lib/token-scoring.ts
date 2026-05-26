import { PumpToken } from './pump-fun-api';

/**
 * Результат скоринга токена
 */
export interface TokenScoreResult {
  score: number;
  maxScore: number;
  progressPercent: number;
  details: {
    curveProgress: number;
    volumeActivity: number;
    holders: number;
    marketCap: number;
    metadata: number;
    security: number;
    age: number;
    smartMoney: number;
  };
  reasons: string[];
  eligible: boolean;
}

// ─── Константы скоринга ─────────────────────────────────────────────

const WEIGHTS = {
  curveProgress: 25,
  volumeActivity: 20,
  holders: 15,
  marketCap: 10,
  smartMoney: 10,
  metadata: 10,
  security: 5,
  age: 5,
} as const;

const THRESHOLDS = {
  minScore: 65,
  curveMin: 0.75,
  curveMax: 0.995,
  volumeMin: 5,
  txMin: 20,
  buySellRatioMin: 0.6,
  holdersMin: 50,
  top10Max: 0.30,
  mcMin: 30_000,
  mcMax: 100_000,
  ageMinMin: 5 * 60 * 1000,   // 5 минут в ms
  ageMaxMs: 2 * 60 * 60 * 1000, // 2 часа в ms
} as const;

// Примерные константы bonding curve Pump.fun
const BONDING_CURVE = {
  initialVirtualSol: 30,
  migrationVirtualSol: 85, // примерный порог миграции
  initialVirtualToken: 1_073_000_000,
} as const;

// ─── Вспомогательные функции ────────────────────────────────────────

/**
 * Вычислить прогресс bonding curve (0.0 – 1.0+)
 * На Pump.fun миграция происходит когда виртуальные SOL-резервы
 * достигают определённого порога (~85 SOL).
 */
function getCurveProgress(token: PumpToken): number {
  const vSol = token.virtualSolReserves ?? token.realSolReserves ?? 0;
  if (vSol <= 0) return 0;

  const progress =
    (vSol - BONDING_CURVE.initialVirtualSol) /
    (BONDING_CURVE.migrationVirtualSol - BONDING_CURVE.initialVirtualSol);

  return Math.max(0, Math.min(1, progress));
}

/**
 * Оценка объёма / активности.
 * Поскольку API не даёт окно 15 мин, используем volume24h и trades как прокси.
 */
function scoreVolumeActivity(token: PumpToken): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  const volume24hSol = (token.volume24h ?? 0) / 50_000; // грубая оценка SOL (при ~$50k/SOL)
  const trades = token.trades ?? token.trades24h ?? 0;

  // Объём: target ≥ 5 SOL за 15 мин ≈ ≥ 200–400 SOL за 24ч для хорошего токена
  // Но для новых токенов volume24h может быть маленьким.
  // Делаем линейную шкалу: 0 баллов при 0, 20 баллов при ≥ 200 SOL/24h
  const volumeScore = Math.min(20, (volume24hSol / 200) * 20);
  score += volumeScore;

  if (volume24hSol < 10) {
    reasons.push(`Низкий объём (~${volume24hSol.toFixed(1)} SOL/24h)`);
  }

  // Транзакции: ≥ 20 tx — полные баллы, линейно до этого
  const txScore = Math.min(20, (trades / 20) * 20);
  score += txScore;

  if (trades < 10) {
    reasons.push(`Мало транзакций (${trades})`);
  }

  // buy/sell ratio — API не предоставляет, ставим нейтральное значение 0.6 (минимальный порог)
  // В будущем можно агрегировать по swap-инструкциям
  const ratioScore = 10; // placeholder до реализации on-chain анализа
  score += ratioScore;

  // Нормализуем до 20 баллов (текущий максимум 50)
  const normalized = (score / 50) * WEIGHTS.volumeActivity;
  return { score: Math.round(normalized), reasons };
}

/**
 * Оценка холдеров.
 */
function scoreHolders(token: PumpToken): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const holders = token.holders ?? 0;

  if (holders < THRESHOLDS.holdersMin) {
    reasons.push(`Холдеров меньше ${THRESHOLDS.holdersMin} (${holders})`);
  }

  // Линейная шкала: 0 → 0 баллов, 50 → 15 баллов
  const raw = Math.min(1, holders / THRESHOLDS.holdersMin) * WEIGHTS.holders;
  return { score: Math.round(raw), reasons };
}

/**
 * Оценка Market Cap.
 */
function scoreMarketCap(token: PumpToken): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const mc = token.usd_market_cap ?? token.marketCap ?? 0;

  if (mc < THRESHOLDS.mcMin) {
    reasons.push(`MC ниже $${(THRESHOLDS.mcMin / 1000).toFixed(0)}k ($${Math.round(mc)})`);
  }
  if (mc > THRESHOLDS.mcMax) {
    reasons.push(`MC выше $${(THRESHOLDS.mcMax / 1000).toFixed(0)}k — возможна миграция`);
  }

  // Идеальный диапазон $30k–$100k = полные баллы
  if (mc >= THRESHOLDS.mcMin && mc <= THRESHOLDS.mcMax) {
    return { score: WEIGHTS.marketCap, reasons };
  }

  // Вне диапазона — линейный спад от края
  const distance = mc < THRESHOLDS.mcMin
    ? mc / THRESHOLDS.mcMin
    : THRESHOLDS.mcMax / mc;

  return { score: Math.round(distance * WEIGHTS.marketCap), reasons };
}

/**
 * Оценка метаданных.
 */
function scoreMetadata(token: PumpToken): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let checks = 0;
  const totalChecks = 4;

  if (token.name && token.name.trim().length > 1) checks++;
  else reasons.push('Отсутствует name');

  if (token.symbol && token.symbol.trim().length > 0) checks++;
  else reasons.push('Отсутствует symbol');

  const hasImage = !!(token.image_uri || token.imageUrl || token.metadataUri || token.uri);
  if (hasImage) checks++;
  else reasons.push('Отсутствует image');

  // website/socials — проверяем через metadata URI как прокси
  const hasSocials = !!(token.metadataUri || token.uri || (token as any).website || (token as any).twitter);
  if (hasSocials) checks++;
  else reasons.push('Отсутствуют соцсети/вебсайт');

  const score = Math.round((checks / totalChecks) * WEIGHTS.metadata);
  return { score, reasons };
}

/**
 * Оценка безопасности (anti-rag).
 */
function scoreSecurity(token: PumpToken): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let checks = 0;
  const totalChecks = 3;

  // Mint authority revoked
  const mintRevoked = token.mintAuthority === null || token.mintAuthority === undefined;
  if (mintRevoked) checks++;
  else reasons.push('Mint authority не отозван');

  // Freeze authority revoked
  const freezeRevoked = token.freezeAuthority === null || token.freezeAuthority === undefined;
  if (freezeRevoked) checks++;
  else reasons.push('Freeze authority не отозван');

  // Honeypot — API не предоставляет, пока считаем true
  // TODO: добавить симуляцию sell (0.1 token) через RPC
  const notHoneypot = true;
  if (notHoneypot) checks++;
  else reasons.push('Возможен honeypot');

  const score = Math.round((checks / totalChecks) * WEIGHTS.security);
  return { score, reasons };
}

/**
 * Оценка возраста токена.
 */
function scoreAge(token: PumpToken): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const created = token.createdTimestamp;

  if (!created) {
    reasons.push('Неизвестный возраст токена');
    return { score: Math.round(WEIGHTS.age * 0.5), reasons };
  }

  const ageMs = Date.now() - created;

  if (ageMs < THRESHOLDS.ageMinMin) {
    reasons.push('Слишком свежий (< 5 мин)');
    return { score: Math.round(WEIGHTS.age * 0.3), reasons };
  }

  if (ageMs > THRESHOLDS.ageMaxMs) {
    reasons.push('Слишком старый (> 2 часов)');
    return { score: Math.round(WEIGHTS.age * 0.2), reasons };
  }

  // Внутри диапазона 5 мин – 2 часа: полные баллы
  return { score: WEIGHTS.age, reasons };
}

/**
 * Smart Money — placeholder.
 * Требует собственной БД или интеграции с внешним API.
 */
function scoreSmartMoney(_token: PumpToken): { score: number; reasons: string[] } {
  // Пока нет интеграции с БД smart money — даём нейтральную оценку 5/10
  // При наличии данных пересчитать:
  // if (smartMoneyBuysLast50Tx > 0) return { score: WEIGHTS.smartMoney, reasons: [] };
  return { score: Math.round(WEIGHTS.smartMoney * 0.5), reasons: ['Smart Money: нет данных'] };
}

// ─── Публичный API ──────────────────────────────────────────────────

/**
 * Рассчитать скор токена по системе New → Soon.
 * Порог попадания в Soon: score ≥ 65 / 100.
 */
export function calculateTokenScore(token: PumpToken): TokenScoreResult {
  const progress = getCurveProgress(token);
  const reasons: string[] = [];

  // ── Прогресс кривой ─────────────────────────────────────────────
  let curveScore = 0;
  if (progress >= THRESHOLDS.curveMin && progress <= THRESHOLDS.curveMax) {
    curveScore = WEIGHTS.curveProgress;
  } else if (progress < THRESHOLDS.curveMin) {
    const ratio = progress / THRESHOLDS.curveMin;
    curveScore = Math.round(ratio * WEIGHTS.curveProgress);
    reasons.push(`Прогресс кривой ${(progress * 100).toFixed(1)}% < ${(THRESHOLDS.curveMin * 100).toFixed(0)}%`);
  } else {
    curveScore = Math.round((1 - progress) / (1 - THRESHOLDS.curveMax) * WEIGHTS.curveProgress);
    reasons.push(`Прогресс кривой ${(progress * 100).toFixed(1)}% > ${(THRESHOLDS.curveMax * 100).toFixed(1)}% (миграция)`);
  }

  // ── Остальные категории ─────────────────────────────────────────
  const volumeRes = scoreVolumeActivity(token);
  const holdersRes = scoreHolders(token);
  const mcRes = scoreMarketCap(token);
  const metaRes = scoreMetadata(token);
  const secRes = scoreSecurity(token);
  const ageRes = scoreAge(token);
  const smRes = scoreSmartMoney(token);

  reasons.push(
    ...volumeRes.reasons,
    ...holdersRes.reasons,
    ...mcRes.reasons,
    ...metaRes.reasons,
    ...secRes.reasons,
    ...ageRes.reasons,
    ...smRes.reasons,
  );

  const totalScore =
    curveScore +
    volumeRes.score +
    holdersRes.score +
    mcRes.score +
    metaRes.score +
    secRes.score +
    ageRes.score +
    smRes.score;

  const maxScore =
    WEIGHTS.curveProgress +
    WEIGHTS.volumeActivity +
    WEIGHTS.holders +
    WEIGHTS.marketCap +
    WEIGHTS.metadata +
    WEIGHTS.security +
    WEIGHTS.age +
    WEIGHTS.smartMoney;

  const eligible = totalScore >= THRESHOLDS.minScore;

  return {
    score: totalScore,
    maxScore,
    progressPercent: Math.round(progress * 1000) / 10,
    details: {
      curveProgress: curveScore,
      volumeActivity: volumeRes.score,
      holders: holdersRes.score,
      marketCap: mcRes.score,
      metadata: metaRes.score,
      security: secRes.score,
      age: ageRes.score,
      smartMoney: smRes.score,
    },
    reasons,
    eligible,
  };
}

/**
 * Проверить, проходит ли токен в колонку Soon.
 */
export function isSoonEligible(token: PumpToken): boolean {
  return calculateTokenScore(token).eligible;
}

/**
 * Отранжировать токены по скору и отфильтровать только eligible.
 */
export function rankTokensForSoon(tokens: PumpToken[]): TokenScoreResult[] {
  return tokens
    .map((t) => calculateTokenScore(t))
    .filter((r) => r.eligible)
    .sort((a, b) => b.score - a.score);
}

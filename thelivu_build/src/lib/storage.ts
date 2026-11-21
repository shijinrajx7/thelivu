import type { LearningProgress, SavedReport, ScanRecord, UserPreferences } from './types';

const KEYS = {
  history: 'thelivu.history.v1',
  reports: 'thelivu.reports.v1',
  learning: 'thelivu.learning.v1',
  preferences: 'thelivu.preferences.v1',
};

function read<T>(key: string, fallback: T): T {
  try {
    const legacy = key.replace('thelivu.', 'truthscan.');
    const value = localStorage.getItem(key) ?? localStorage.getItem(legacy);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch { return fallback; }
}
function write<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage can be disabled/full */ }
}

export function getHistory(): ScanRecord[] { return read(KEYS.history, []); }
export function saveHistory(record: ScanRecord): void {
  const items = [record, ...getHistory().filter((item) => item.id !== record.id)].slice(0, 100);
  write(KEYS.history, items);
}
export function clearHistory(): void { localStorage.removeItem(KEYS.history); localStorage.removeItem('truthscan.history.v1'); }
export function getReports(): SavedReport[] { return read(KEYS.reports, []); }
export function saveReport(report: SavedReport): void {
  write(KEYS.reports, [report, ...getReports().filter((item) => item.id !== report.id)].slice(0, 100));
}
export function deleteReport(reportId: string): void { write(KEYS.reports, getReports().filter((item) => item.id !== reportId)); }
export function getLearning(): LearningProgress { return read(KEYS.learning, { completed: [], scores: {} }); }
export function updateLearning(moduleId: string, score: number, isDaily = false): LearningProgress {
  const current = getLearning();
  const today = new Date().toISOString().slice(0, 10);
  const next: LearningProgress = {
    completed: [...new Set([...current.completed, moduleId])],
    scores: { ...current.scores, [moduleId]: Math.max(current.scores[moduleId] ?? 0, score) },
    ...(isDaily ? { lastChallengeDate: today } : current.lastChallengeDate ? { lastChallengeDate: current.lastChallengeDate } : {}),
  };
  write(KEYS.learning, next);
  return next;
}
export function getPreferences(): UserPreferences {
  return read(KEYS.preferences, { language: 'en', theme: 'dark', introSeen: false });
}
export function savePreferences(preferences: UserPreferences): void { write(KEYS.preferences, preferences); }
export function clearAllLocalData(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key.replace('thelivu.', 'truthscan.')));
}

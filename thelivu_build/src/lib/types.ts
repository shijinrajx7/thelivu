export type Assessment = 'High Risk' | 'Suspicious' | 'No Known Threat Detected' | 'Inconclusive' | 'Insufficient Evidence' | 'Supported by Available Evidence' | 'Contradicted by Available Evidence' | 'Partially Supported' | 'Missing Context' | 'Not configured';
export type FindingSeverity = 'high' | 'medium' | 'low' | 'info';
export type RecordType = 'website' | 'message' | 'claim' | 'image' | 'video' | 'security-review';

export interface Finding {
  id: string;
  title: string;
  detail: string;
  severity: FindingSeverity;
  evidence?: string;
  source: string;
}

export interface ScanRecord {
  id: string;
  type: RecordType;
  label: string;
  assessment: Assessment;
  summary: string;
  checkedAt: string;
  findings: Finding[];
  coverage: string[];
}

export interface SavedReport {
  id: string;
  title: string;
  createdAt: string;
  record: ScanRecord;
}

export type EvidenceStance = 'support' | 'contradict' | 'context' | 'unverified';
export interface ClaimEvidence {
  id: string;
  url: string;
  note: string;
  stance: EvidenceStance;
  publicationDate?: string;
}

export interface LearningProgress {
  completed: string[];
  scores: Record<string, number>;
  lastChallengeDate?: string;
}

export interface UserPreferences {
  language: 'en' | 'ml' | 'hi';
  theme: 'dark' | 'light';
  introSeen: boolean;
}

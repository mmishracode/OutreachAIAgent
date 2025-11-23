
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SEARCH = 'SEARCH',
  LEADS = 'LEADS'
}

export interface Lead {
  id: string;
  name: string;
  role: string; // e.g., Influencer, Agency, Coach
  description: string;
  sourceUrl?: string;
  email?: string; // Added email field
  status: 'NEW' | 'DRAFTED' | 'SENT' | 'REPLIED';
  emailDraft?: string;
  emailSubject?: string; // Added subject line storage
  dateAdded: string;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface SearchResult {
  rawText: string;
  sources: GroundingSource[];
}

export interface UserProfile {
  name: string;
  business: string;
  offer: string;
}

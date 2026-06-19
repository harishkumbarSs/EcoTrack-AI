export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'achievement' | 'challenge';
  condition: string;
}

export interface Achievement {
  id: number;
  session_id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export interface SustainabilityScore {
  score: number;
  label: string;
  color: string;
  message: string;
  percentile: number;
}

export interface GamificationSummary {
  score: SustainabilityScore;
  streak: number;
  totalActivities: number;
  achievements: Achievement[];
  nextBadge: Badge | null;
  totalCo2eSaved: number;
}

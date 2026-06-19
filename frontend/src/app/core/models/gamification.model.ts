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

export interface GamificationData {
  earned: Achievement[];
  allBadges: Badge[];
  score: SustainabilityScore;
  streak: number;
  nextBadge: Badge | null;
  totalCo2eSaved: number;
  totalActivities: number;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  potentialSaving: string;
  icon: string;
  actionType: 'quick_win' | 'long_term';
}

export interface InsightsData {
  recommendations: Recommendation[];
  topEmissionSource: string;
  weeklyReport: {
    totalCo2e: number;
    dailyAverage: number;
    vsGlobalAverage: number;
    vsLastWeek: number;
    breakdown: Array<{ type: string; co2e: number }>;
  };
  improvementActions: string[];
}

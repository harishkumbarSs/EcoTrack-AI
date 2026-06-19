import { EMISSION_FACTORS } from '../../config/emission-factors';
import { ActivityType } from '../activities/activity.types';

export interface EmissionFactorResult {
  factor: number;
  unit: string;
  label: string;
}

/**
 * Carbon Calculation Engine
 *
 * Reusable service for computing CO₂e emissions from activities.
 * All emission factors sourced from IPCC AR6, EPA, and DEFRA (2023).
 */
export class CarbonCalculator {
  /**
   * Calculate CO₂e for a given activity.
   * @param type     Activity category
   * @param subType  Specific activity sub-type
   * @param value    Quantity (in the unit for that sub-type)
   * @returns        CO₂e in kilograms
   */
  public calculate(type: ActivityType, subType: string, value: number): number {
    if (value <= 0) return 0;

    const factor = this.getEmissionFactor(type, subType);
    if (factor === null) {
      throw new Error(`Unknown emission sub-type: ${type}/${subType}`);
    }

    return parseFloat((value * factor).toFixed(4));
  }

  /**
   * Get emission factor for a specific activity.
   */
  public getEmissionFactor(type: ActivityType, subType: string): number | null {
    const categoryFactors = EMISSION_FACTORS[type] as Record<
      string,
      { factor: number; unit: string; label: string }
    >;

    if (!categoryFactors || !(subType in categoryFactors)) {
      return null;
    }

    return categoryFactors[subType].factor;
  }

  /**
   * Get all available sub-types for a given category.
   */
  public getSubTypes(type: ActivityType): EmissionFactorResult[] {
    const categoryFactors = EMISSION_FACTORS[type] as Record<
      string,
      { factor: number; unit: string; label: string }
    >;

    return Object.entries(categoryFactors).map(([_key, value]) => ({
      factor: value.factor,
      unit: value.unit,
      label: value.label,
    }));
  }

  /**
   * Calculate sustainability score (0-100) from daily kg CO₂e.
   * Higher score = more sustainable.
   */
  public calculateScore(dailyKgCo2e: number): number {
    if (dailyKgCo2e <= 0) return 100;
    if (dailyKgCo2e <= 3) return Math.round(90 + (3 - dailyKgCo2e) * (10 / 3));
    if (dailyKgCo2e <= 6) return Math.round(70 + ((6 - dailyKgCo2e) / 3) * 20);
    if (dailyKgCo2e <= 10) return Math.round(50 + ((10 - dailyKgCo2e) / 4) * 20);
    if (dailyKgCo2e <= 15) return Math.round(30 + ((15 - dailyKgCo2e) / 5) * 20);
    return Math.max(0, Math.round(30 - (dailyKgCo2e - 15) * 2));
  }

  /**
   * Convert kg CO₂e to equivalent real-world comparisons.
   */
  public getEquivalents(kgCo2e: number): Record<string, string> {
    return {
      car_km: `${(kgCo2e / 0.192).toFixed(1)} km driven (petrol car)`,
      tree_days: `${(kgCo2e / 0.06).toFixed(1)} days of tree absorption`,
      smartphone_charges: `${Math.round(kgCo2e / 0.008)} smartphone charges`,
      beef_grams: `${Math.round(kgCo2e / 0.027)} g of beef`,
    };
  }
}

export const carbonCalculator = new CarbonCalculator();

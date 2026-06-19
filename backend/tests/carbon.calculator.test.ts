import { CarbonCalculator } from '../src/modules/carbon/carbon.calculator';

describe('CarbonCalculator', () => {
  let calculator: CarbonCalculator;

  beforeEach(() => {
    calculator = new CarbonCalculator();
  });

  // ─── calculate() ──────────────────────────────────────────────────────────

  describe('calculate()', () => {
    it('should calculate transport emissions for petrol car correctly', () => {
      // 100 km * 0.192 kg CO₂e/km = 19.2 kg CO₂e
      const result = calculator.calculate('transport', 'car_petrol', 100);
      expect(result).toBeCloseTo(19.2, 2);
    });

    it('should return 0 for bicycle transport (zero emission)', () => {
      const result = calculator.calculate('transport', 'bicycle', 50);
      expect(result).toBe(0);
    });

    it('should calculate electricity emissions for grid power', () => {
      // 10 kWh * 0.233 kg/kWh = 2.33 kg CO₂e
      const result = calculator.calculate('electricity', 'grid', 10);
      expect(result).toBeCloseTo(2.33, 2);
    });

    it('should calculate food emissions for beef', () => {
      // 0.5 kg beef * 27 kg CO₂e/kg = 13.5 kg CO₂e
      const result = calculator.calculate('food', 'beef', 0.5);
      expect(result).toBeCloseTo(13.5, 2);
    });

    it('should calculate waste emissions for landfill', () => {
      // 2 kg waste * 0.52 kg CO₂e/kg = 1.04 kg CO₂e
      const result = calculator.calculate('waste', 'landfill', 2);
      expect(result).toBeCloseTo(1.04, 2);
    });

    it('should return 0 for zero value', () => {
      const result = calculator.calculate('transport', 'car_petrol', 0);
      expect(result).toBe(0);
    });

    it('should throw for unknown sub-type', () => {
      expect(() => calculator.calculate('transport', 'flying_carpet', 10)).toThrow(
        'Unknown emission sub-type: transport/flying_carpet'
      );
    });

    it('should emit less for electric car than petrol car (same distance)', () => {
      const electric = calculator.calculate('transport', 'car_electric', 100);
      const petrol = calculator.calculate('transport', 'car_petrol', 100);
      expect(electric).toBeLessThan(petrol);
    });

    it('should emit less for plant protein than beef (same weight)', () => {
      const plant = calculator.calculate('food', 'plant_protein', 1);
      const beef = calculator.calculate('food', 'beef', 1);
      expect(plant).toBeLessThan(beef);
    });

    it('should emit less for recycled waste than landfill', () => {
      const recycled = calculator.calculate('waste', 'recycled', 1);
      const landfill = calculator.calculate('waste', 'landfill', 1);
      expect(recycled).toBeLessThan(landfill);
    });
  });

  // ─── calculateScore() ─────────────────────────────────────────────────────

  describe('calculateScore()', () => {
    it('should return 100 for zero daily footprint', () => {
      expect(calculator.calculateScore(0)).toBe(100);
    });

    it('should return 90+ for excellent footprint (< 3 kg/day)', () => {
      expect(calculator.calculateScore(2)).toBeGreaterThanOrEqual(90);
    });

    it('should return 70-89 for good footprint (3-6 kg/day)', () => {
      const score = calculator.calculateScore(4.5);
      expect(score).toBeGreaterThanOrEqual(70);
      expect(score).toBeLessThan(90);
    });

    it('should return 50-69 for average footprint (6-10 kg/day)', () => {
      const score = calculator.calculateScore(8);
      expect(score).toBeGreaterThanOrEqual(50);
      expect(score).toBeLessThan(70);
    });

    it('should return 30-49 for below average footprint (10-15 kg/day)', () => {
      const score = calculator.calculateScore(12);
      expect(score).toBeGreaterThanOrEqual(30);
      expect(score).toBeLessThan(50);
    });

    it('should return < 30 for critical footprint (> 15 kg/day)', () => {
      expect(calculator.calculateScore(20)).toBeLessThan(30);
    });

    it('should return 0 for very high footprint', () => {
      expect(calculator.calculateScore(100)).toBeGreaterThanOrEqual(0);
    });

    it('should have monotonically decreasing scores as footprint increases', () => {
      const scores = [1, 3, 6, 10, 15, 20].map((v) => calculator.calculateScore(v));
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
      }
    });
  });

  // ─── getEmissionFactor() ──────────────────────────────────────────────────

  describe('getEmissionFactor()', () => {
    it('should return correct factor for known sub-type', () => {
      expect(calculator.getEmissionFactor('transport', 'car_petrol')).toBe(0.192);
    });

    it('should return null for unknown sub-type', () => {
      expect(calculator.getEmissionFactor('transport', 'unknown')).toBeNull();
    });

    it('should return 0 for zero-emission modes', () => {
      expect(calculator.getEmissionFactor('transport', 'bicycle')).toBe(0);
      expect(calculator.getEmissionFactor('transport', 'walking')).toBe(0);
    });
  });

  // ─── getEquivalents() ─────────────────────────────────────────────────────

  describe('getEquivalents()', () => {
    it('should return equivalents object with expected keys', () => {
      const equiv = calculator.getEquivalents(19.2);
      expect(equiv).toHaveProperty('car_km');
      expect(equiv).toHaveProperty('tree_days');
      expect(equiv).toHaveProperty('smartphone_charges');
      expect(equiv).toHaveProperty('beef_grams');
    });

    it('should report ~100 km for 19.2 kg CO₂e (petrol car)', () => {
      const equiv = calculator.getEquivalents(19.2);
      expect(equiv.car_km).toContain('100.0');
    });
  });
});

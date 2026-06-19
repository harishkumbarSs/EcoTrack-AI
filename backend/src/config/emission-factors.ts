/**
 * Emission Factors Configuration
 *
 * Sources:
 * - IPCC AR6 (2021): https://www.ipcc.ch/report/ar6/
 * - EPA Emission Factors Hub (2023): https://www.epa.gov/climateleadership/ghg-emission-factors-hub
 * - DEFRA GHG Conversion Factors (2023): https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting
 * - OurWorldInData: https://ourworldindata.org/carbon-footprint-food-methane
 *
 * All values in kg CO₂e per unit
 */

export const EMISSION_FACTORS = {
  transport: {
    car_petrol: {
      factor: 0.192,   // kg CO₂e per km (average petrol car)
      unit: 'km',
      label: 'Car (Petrol)',
      icon: '🚗',
    },
    car_diesel: {
      factor: 0.171,   // kg CO₂e per km (average diesel car)
      unit: 'km',
      label: 'Car (Diesel)',
      icon: '🚙',
    },
    car_electric: {
      factor: 0.053,   // kg CO₂e per km (average EV, global grid)
      unit: 'km',
      label: 'Car (Electric)',
      icon: '⚡',
    },
    bus: {
      factor: 0.089,   // kg CO₂e per km (average bus)
      unit: 'km',
      label: 'Bus',
      icon: '🚌',
    },
    train: {
      factor: 0.041,   // kg CO₂e per km (average train)
      unit: 'km',
      label: 'Train',
      icon: '🚆',
    },
    subway: {
      factor: 0.028,   // kg CO₂e per km (subway/metro)
      unit: 'km',
      label: 'Subway/Metro',
      icon: '🚇',
    },
    flight_short: {
      factor: 0.255,   // kg CO₂e per km (short haul < 3700km, with RFI)
      unit: 'km',
      label: 'Flight (Short Haul)',
      icon: '✈️',
    },
    flight_long: {
      factor: 0.195,   // kg CO₂e per km (long haul > 3700km, with RFI)
      unit: 'km',
      label: 'Flight (Long Haul)',
      icon: '🛫',
    },
    motorcycle: {
      factor: 0.114,   // kg CO₂e per km
      unit: 'km',
      label: 'Motorcycle',
      icon: '🏍️',
    },
    bicycle: {
      factor: 0.0,     // Zero emissions
      unit: 'km',
      label: 'Bicycle',
      icon: '🚲',
    },
    walking: {
      factor: 0.0,     // Zero emissions
      unit: 'km',
      label: 'Walking',
      icon: '🚶',
    },
  },

  electricity: {
    grid: {
      factor: 0.233,   // kg CO₂e per kWh (global average, IEA 2023)
      unit: 'kWh',
      label: 'Grid Electricity',
      icon: '🔌',
    },
    solar: {
      factor: 0.041,   // kg CO₂e per kWh (lifecycle, rooftop solar)
      unit: 'kWh',
      label: 'Solar Power',
      icon: '☀️',
    },
    wind: {
      factor: 0.011,   // kg CO₂e per kWh (lifecycle, wind)
      unit: 'kWh',
      label: 'Wind Power',
      icon: '💨',
    },
    coal: {
      factor: 0.820,   // kg CO₂e per kWh (coal-fired)
      unit: 'kWh',
      label: 'Coal Power',
      icon: '⚫',
    },
    natural_gas: {
      factor: 0.490,   // kg CO₂e per kWh (natural gas)
      unit: 'kWh',
      label: 'Natural Gas',
      icon: '🔥',
    },
  },

  food: {
    beef: {
      factor: 27.0,    // kg CO₂e per kg (beef, incl. land use)
      unit: 'kg',
      label: 'Beef',
      icon: '🥩',
    },
    lamb: {
      factor: 39.2,    // kg CO₂e per kg
      unit: 'kg',
      label: 'Lamb',
      icon: '🐑',
    },
    pork: {
      factor: 12.1,    // kg CO₂e per kg
      unit: 'kg',
      label: 'Pork',
      icon: '🥓',
    },
    chicken: {
      factor: 6.9,     // kg CO₂e per kg
      unit: 'kg',
      label: 'Chicken',
      icon: '🍗',
    },
    fish: {
      factor: 6.1,     // kg CO₂e per kg (average farmed fish)
      unit: 'kg',
      label: 'Fish',
      icon: '🐟',
    },
    dairy_milk: {
      factor: 3.2,     // kg CO₂e per litre
      unit: 'litre',
      label: 'Dairy Milk',
      icon: '🥛',
    },
    eggs: {
      factor: 4.8,     // kg CO₂e per kg
      unit: 'kg',
      label: 'Eggs',
      icon: '🥚',
    },
    rice: {
      factor: 4.0,     // kg CO₂e per kg (methane from paddies)
      unit: 'kg',
      label: 'Rice',
      icon: '🍚',
    },
    vegetables: {
      factor: 2.0,     // kg CO₂e per kg (average vegetables)
      unit: 'kg',
      label: 'Vegetables',
      icon: '🥦',
    },
    plant_protein: {
      factor: 1.1,     // kg CO₂e per kg (legumes, tofu, etc.)
      unit: 'kg',
      label: 'Plant Protein (Legumes/Tofu)',
      icon: '🫘',
    },
    bread_cereals: {
      factor: 1.4,     // kg CO₂e per kg
      unit: 'kg',
      label: 'Bread & Cereals',
      icon: '🍞',
    },
  },

  waste: {
    landfill: {
      factor: 0.52,    // kg CO₂e per kg (mixed waste to landfill)
      unit: 'kg',
      label: 'Landfill Waste',
      icon: '🗑️',
    },
    recycled: {
      factor: 0.021,   // kg CO₂e per kg (recycled materials)
      unit: 'kg',
      label: 'Recycled Waste',
      icon: '♻️',
    },
    composted: {
      factor: 0.057,   // kg CO₂e per kg (composted organic waste)
      unit: 'kg',
      label: 'Composted Waste',
      icon: '🌱',
    },
    incinerated: {
      factor: 0.21,    // kg CO₂e per kg (waste-to-energy)
      unit: 'kg',
      label: 'Incinerated Waste',
      icon: '🔥',
    },
  },
} as const;

// Global average daily carbon footprint (kg CO₂e/day)
export const GLOBAL_AVERAGES = {
  daily_kg_co2e: 13.0,         // ~4.7 tonnes/year
  transport_daily: 3.8,
  electricity_daily: 2.1,
  food_daily: 5.4,
  waste_daily: 1.7,
};

// Sustainability score thresholds (kg CO₂e/day)
export const SCORE_THRESHOLDS = {
  excellent: 3.0,    // < 3 kg/day: score 90-100
  good: 6.0,         // 3-6 kg/day: score 70-90
  average: 10.0,     // 6-10 kg/day: score 50-70
  poor: 15.0,        // 10-15 kg/day: score 30-50
  critical: Infinity, // > 15 kg/day: score 0-30
};

export type TransportType = keyof typeof EMISSION_FACTORS.transport;
export type ElectricityType = keyof typeof EMISSION_FACTORS.electricity;
export type FoodType = keyof typeof EMISSION_FACTORS.food;
export type WasteType = keyof typeof EMISSION_FACTORS.waste;

/**
 * 熱力学計算関連の型定義
 */

export interface BottleMaterial {
  id: 'glass' | 'plastic' | 'ppsu';
  name: string;
  thermalConductivity: number; // W/(m·K)
  thickness: number; // m
  density: number; // kg/m³
  specificHeat: number; // J/(kg·K)
}

export interface CoolingMethod {
  id: 'ice_stir' | 'ice_still' | 'running_water' | 'ice_water_running' | 'air';
  name: string;
  description: string;
  ambientTemp: number; // °C
  velocity: number; // m/s
  baseH: number; // W/(m²·K)
  velocityFactor: number;
  recommendedPriority: number; // 1=最推奨
}

export interface ThermalCalculationParams {
  initialTemp: number;
  targetTemp: number;
  volume: number;
  material: BottleMaterial;
  method: CoolingMethod;
  roomTemp?: number;
}

export interface ThermalCalculationResult {
  currentTemp: number;
  coolingRate: number; // °C/min
  timeToTarget: number; // minutes
  progress: number; // 0-1
}

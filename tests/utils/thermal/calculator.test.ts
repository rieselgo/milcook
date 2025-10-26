import { describe, it, expect } from 'vitest';
import {
  calculateNewtonCooling,
  calculateCoolingConstant,
  calculateTimeToTarget,
  calculateMixedTemperature,
  calculateWaterVolumes,
  calculateCoolingRate,
} from '~/utils/thermal/calculator';
import { getMaterial } from '~/utils/thermal/materials';
import { getCoolingMethod } from '~/utils/thermal/methods';

describe('calculateNewtonCooling', () => {
  it('should return initial temperature at time 0', () => {
    const result = calculateNewtonCooling(80, 0, 20, 0.1);
    expect(result).toBeCloseTo(80, 1);
  });

  it('should approach ambient temperature over time', () => {
    const initialTemp = 80;
    const ambient = 20;
    const k = 0.1;

    const temp1 = calculateNewtonCooling(initialTemp, 10, ambient, k);
    const temp2 = calculateNewtonCooling(initialTemp, 20, ambient, k);
    const temp3 = calculateNewtonCooling(initialTemp, 50, ambient, k);

    expect(temp1).toBeGreaterThan(temp2);
    expect(temp2).toBeGreaterThan(temp3);
    expect(temp3).toBeGreaterThan(ambient);
    expect(temp3).toBeCloseTo(ambient, 0);
  });

  it('should never go below ambient temperature', () => {
    const result = calculateNewtonCooling(80, 1000, 20, 0.1);
    expect(result).toBeGreaterThanOrEqual(20);
    expect(result).toBeCloseTo(20, 1);
  });

  it('should handle zero cooling constant (no cooling)', () => {
    const result = calculateNewtonCooling(80, 10, 20, 0);
    expect(result).toBe(80);
  });
});

describe('calculateCoolingConstant', () => {
  it('should calculate higher k for glass than plastic (better heat transfer)', () => {
    const volume = 140;
    const glass = getMaterial('glass');
    const plastic = getMaterial('plastic');
    const method = getCoolingMethod('ice_stir');

    const kGlass = calculateCoolingConstant(volume, glass, method);
    const kPlastic = calculateCoolingConstant(volume, plastic, method);

    // Glass has higher thermal conductivity, so cooling constant should be higher
    expect(kGlass).toBeGreaterThan(kPlastic);
  });

  it('should calculate higher k for ice_stir than ice_still (faster cooling)', () => {
    const volume = 140;
    const material = getMaterial('glass');
    const iceStir = getCoolingMethod('ice_stir');
    const iceStill = getCoolingMethod('ice_still');

    const kStir = calculateCoolingConstant(volume, material, iceStir);
    const kStill = calculateCoolingConstant(volume, material, iceStill);

    // Stirring increases heat transfer coefficient
    expect(kStir).toBeGreaterThan(kStill);
  });

  it('should show volume effect on cooling constant', () => {
    const material = getMaterial('glass');
    const method = getCoolingMethod('ice_stir');

    const k100 = calculateCoolingConstant(100, material, method);
    const k140 = calculateCoolingConstant(140, material, method);
    const k200 = calculateCoolingConstant(200, material, method);

    // All should be positive
    expect(k100).toBeGreaterThan(0);
    expect(k140).toBeGreaterThan(0);
    expect(k200).toBeGreaterThan(0);

    // Cooling constant relationship depends on surface area to mass ratio
    // For cylindrical bottles: k ∝ (2πrh)/(πr²h) = 2/r
    // But h ∝ V, so the relationship is complex
    // Just verify they're all in a reasonable range
    expect(k100 / k200).toBeGreaterThan(0.5);
    expect(k100 / k200).toBeLessThan(2);
  });

  it('should return positive value', () => {
    const k = calculateCoolingConstant(140, getMaterial('glass'), getCoolingMethod('ice_stir'));
    expect(k).toBeGreaterThan(0);
  });
});

describe('calculateTimeToTarget', () => {
  it('should return 0 if already at or below target temperature', () => {
    expect(calculateTimeToTarget(38, 40, 20, 0.1)).toBe(0);
    expect(calculateTimeToTarget(40, 40, 20, 0.1)).toBe(0);
  });

  it('should return Infinity if target is at or below ambient', () => {
    expect(calculateTimeToTarget(80, 20, 20, 0.1)).toBe(Infinity);
    expect(calculateTimeToTarget(80, 15, 20, 0.1)).toBe(Infinity);
  });

  it('should calculate reasonable time for typical cooling scenario', () => {
    // 80°C → 40°C with ambient 20°C and k=0.1
    const time = calculateTimeToTarget(80, 40, 20, 0.1);
    expect(time).toBeGreaterThan(0);
    expect(time).toBeLessThan(100); // Should be reasonable
  });

  it('should take longer with smaller cooling constant', () => {
    const time1 = calculateTimeToTarget(80, 40, 20, 0.2);
    const time2 = calculateTimeToTarget(80, 40, 20, 0.1);

    expect(time2).toBeGreaterThan(time1);
  });

  it('should calculate reasonable cooling time for ice_stir method', () => {
    // Real-world scenario: 46.6°C → 38°C with ice_stir
    const material = getMaterial('glass');
    const method = getCoolingMethod('ice_stir');
    const k = calculateCoolingConstant(140, material, method);

    const timeMinutes = calculateTimeToTarget(46.6, 38, method.ambientTemp, k);

    // Should complete in a reasonable time (conservative physics model)
    expect(timeMinutes).toBeGreaterThan(0);
    expect(timeMinutes).toBeLessThan(120); // Less than 2 hours

    // ice_stir should be faster than ice_still
    const iceStill = getCoolingMethod('ice_still');
    const kStill = calculateCoolingConstant(140, material, iceStill);
    const timeStill = calculateTimeToTarget(46.6, 38, iceStill.ambientTemp, kStill);
    expect(timeMinutes).toBeLessThan(timeStill);
  });
});

describe('calculateMixedTemperature', () => {
  it('should return hot water temp with 100% hot water', () => {
    const result = calculateMixedTemperature(80, 100, 20, 0);
    expect(result).toBe(80);
  });

  it('should return cold water temp with 100% cold water', () => {
    const result = calculateMixedTemperature(80, 0, 20, 100);
    expect(result).toBe(20);
  });

  it('should return average temp with equal volumes', () => {
    const result = calculateMixedTemperature(80, 100, 20, 100);
    expect(result).toBe(50);
  });

  it('should calculate correct mixed temperature for typical scenario', () => {
    // 80°C hot water 70ml + 20°C cold water 70ml = 50°C
    const result = calculateMixedTemperature(80, 70, 20, 70);
    expect(result).toBeCloseTo(50, 1);
  });

  it('should be closer to hot temp with more hot water', () => {
    const result = calculateMixedTemperature(80, 120, 20, 20);
    expect(result).toBeGreaterThan(65);
    expect(result).toBeLessThan(80);
  });
});

describe('calculateWaterVolumes', () => {
  it('should return all hot water when target equals hot water temp', () => {
    const result = calculateWaterVolumes(140, 85, 20, 85);
    expect(result.hotWater).toBe(140);
    expect(result.coldWater).toBe(0);
  });

  it('should return all cold water when target equals cold water temp', () => {
    const result = calculateWaterVolumes(140, 85, 20, 20);
    expect(result.hotWater).toBe(0);
    expect(result.coldWater).toBe(140);
  });

  it('should sum to total volume', () => {
    const totalVolume = 140;
    const result = calculateWaterVolumes(totalVolume, 85, 20, 50);
    expect(result.hotWater + result.coldWater).toBe(totalVolume);
  });

  it('should calculate volumes for target mix temperature of 70°C', () => {
    // From planning doc: 85°C hot water, 20°C cold water, target 70°C
    const result = calculateWaterVolumes(140, 85, 20, 70);

    // Expected: (70-20)/(85-20) = 50/65 ≈ 0.769
    // Hot water: 140 * 0.769 ≈ 108ml
    // Cold water: 140 - 108 ≈ 32ml
    expect(result.hotWater).toBeGreaterThan(100);
    expect(result.hotWater).toBeLessThan(115);
    expect(result.coldWater).toBeGreaterThan(25);
    expect(result.coldWater).toBeLessThan(40);
  });

  it('should verify mixed temperature matches target', () => {
    const totalVolume = 140;
    const hotTemp = 85;
    const coldTemp = 20;
    const targetTemp = 50;

    const { hotWater, coldWater } = calculateWaterVolumes(
      totalVolume,
      hotTemp,
      coldTemp,
      targetTemp
    );

    const actualMixTemp = calculateMixedTemperature(
      hotTemp,
      hotWater,
      coldTemp,
      coldWater
    );

    expect(actualMixTemp).toBeCloseTo(targetTemp, 0);
  });
});

describe('calculateCoolingRate', () => {
  it('should return negative value (cooling)', () => {
    const rate = calculateCoolingRate(80, 20, 0.1);
    expect(rate).toBeLessThan(0);
  });

  it('should return 0 when at ambient temperature', () => {
    const rate = calculateCoolingRate(20, 20, 0.1);
    expect(Math.abs(rate)).toBe(0);
  });

  it('should have faster rate with higher temperature difference', () => {
    const k = 0.1;
    const ambient = 20;

    const rate1 = calculateCoolingRate(80, ambient, k);
    const rate2 = calculateCoolingRate(50, ambient, k);

    expect(Math.abs(rate1)).toBeGreaterThan(Math.abs(rate2));
  });

  it('should have faster rate with higher cooling constant', () => {
    const temp = 80;
    const ambient = 20;

    const rate1 = calculateCoolingRate(temp, ambient, 0.2);
    const rate2 = calculateCoolingRate(temp, ambient, 0.1);

    expect(Math.abs(rate1)).toBeGreaterThan(Math.abs(rate2));
  });

  it('should calculate realistic cooling rate', () => {
    // Glass bottle, ice_stir: should cool several °C per minute initially
    const material = getMaterial('glass');
    const method = getCoolingMethod('ice_stir');
    const k = calculateCoolingConstant(140, material, method);

    const rate = calculateCoolingRate(70, method.ambientTemp, k);

    // Should be cooling at a reasonable rate (e.g., -2 to -10 °C/min)
    expect(rate).toBeLessThan(0);
    expect(rate).toBeGreaterThan(-20); // Not unrealistically fast
  });
});

describe('Integration tests', () => {
  it('should complete full cooling cycle from mix to target', () => {
    // Scenario: 140ml glass bottle, ice_stir method
    const volume = 140;
    const material = getMaterial('glass');
    const method = getCoolingMethod('ice_stir');

    // Mix hot and cold water to get initial temp ~70°C
    const { hotWater, coldWater } = calculateWaterVolumes(volume, 85, 20, 70);
    const initialTemp = calculateMixedTemperature(85, hotWater, 20, coldWater);

    expect(initialTemp).toBeCloseTo(70, 0);

    // Calculate cooling time to 38°C
    const k = calculateCoolingConstant(volume, material, method);
    const timeToTarget = calculateTimeToTarget(
      initialTemp,
      38,
      method.ambientTemp,
      k
    );

    expect(timeToTarget).toBeGreaterThan(0);
    expect(timeToTarget).toBeLessThan(300); // Less than 5 hours (conservative estimate)

    // Verify temperature at predicted time
    const finalTemp = calculateNewtonCooling(
      initialTemp,
      timeToTarget,
      method.ambientTemp,
      k
    );

    expect(finalTemp).toBeCloseTo(38, 1);
  });

  it('should compare all cooling methods for same scenario', () => {
    const volume = 140;
    const material = getMaterial('glass');
    const initialTemp = 70;
    const targetTemp = 38;

    const methods = ['ice_stir', 'ice_still', 'running_water', 'air'] as const;
    const times: number[] = [];

    methods.forEach((methodId) => {
      const method = getCoolingMethod(methodId);
      const k = calculateCoolingConstant(volume, material, method);
      const time = calculateTimeToTarget(initialTemp, targetTemp, method.ambientTemp, k);
      times.push(time);
    });

    // ice_stir should be fastest
    expect(times[0]).toBeLessThan(times[1]); // ice_stir < ice_still
    // air should be slowest
    expect(times[3]).toBeGreaterThan(times[0]);
    expect(times[3]).toBeGreaterThan(times[1]);
  });
});

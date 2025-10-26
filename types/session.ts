/**
 * セッション関連の型定義
 */

export interface MilkSession {
  id?: number;
  timestamp: Date;

  // 設定
  volume: number; // ml
  bottleMaterialId: string;
  coolingMethodId: string;

  // 温度
  hotWaterTemp: number; // °C
  hotWaterVolume: number; // ml
  coldWaterTemp: number; // °C
  coldWaterVolume: number; // ml
  initialTemp: number; // 混合後の温度（°C）
  targetTemp: number; // °C

  // タイマー
  predictedTime: number; // 予測時間（秒）
  actualTime?: number; // 実測時間（秒）
  stirCount?: number; // 揺らした回数

  // ステータス
  completed: boolean;

  // 環境
  roomTemp?: number; // °C
  notes?: string; // メモ
}

export interface SessionSettings {
  volume: number;
  bottleMaterialId: string;
  targetTemp: number;
  roomTemp: number;
  coldWaterTemp: number;
}

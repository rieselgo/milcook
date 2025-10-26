import React, { useState, useEffect } from 'react';
import { Clock, Droplets, Wind, Thermometer, Settings, History, CheckCircle, AlertCircle } from 'lucide-react';

export default function MilkTimerMockup() {
  const [screen, setScreen] = useState('home');
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTemp, setCurrentTemp] = useState(46.6);
  const [shakeCount, setShakeCount] = useState(0);
  const [nextShake, setNextShake] = useState(15);
  
  const [settings, setSettings] = useState({
    volume: 140,
    material: 'glass',
    method: 'ice_stir',
    targetTemp: 38
  });
  
  const targetTemp = 38;
  const k = 0.2401; // 冷却定数（氷水攪拌・ガラス）
  const ambient = 2;
  
  // タイマー処理
  useEffect(() => {
    let interval;
    if (isRunning && screen === 'timer') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
        setNextShake(prev => Math.max(0, prev - 1));
        
        // 温度計算
        const elapsedMin = (timer + 1) / 60;
        const temp = ambient + (46.6 - ambient) * Math.exp(-k * elapsedMin);
        setCurrentTemp(temp);
        
        if (temp <= targetTemp) {
          setIsRunning(false);
          setScreen('complete');
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, screen, timer]);
  
  const handleShake = () => {
    setShakeCount(prev => prev + 1);
    setNextShake(15);
    // バイブレーション風の視覚効果
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };
  
  const startTimer = () => {
    setTimer(0);
    setCurrentTemp(46.6);
    setShakeCount(0);
    setNextShake(15);
    setIsRunning(true);
    setScreen('timer');
  };
  
  const getTempColor = (temp) => {
    if (temp >= 45) return 'from-orange-600 to-orange-500';
    if (temp >= 42) return 'from-orange-500 to-orange-400';
    if (temp >= 40) return 'from-orange-400 to-yellow-400';
    if (temp >= 38) return 'from-yellow-400 to-green-400';
    return 'from-green-500 to-green-400';
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = Math.min(100, ((46.6 - currentTemp) / (46.6 - targetTemp)) * 100);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* ホーム画面 */}
        {screen === 'home' && (
          <>
            <div className="bg-gradient-to-br from-pink-300 via-purple-200 to-blue-200 p-8 text-center relative overflow-hidden">
              {/* 装飾的な円 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-20 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-20 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative">
                <div className="text-6xl mb-3">🍼</div>
                <h1 className="text-3xl font-bold text-white mb-2" style={{textShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                  調乳タイマー
                </h1>
                <p className="text-white text-sm opacity-90">ミルクを適温で、赤ちゃんに笑顔を</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4 -mt-4">
              {/* メインアクション */}
              <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-pink-100">
                <div className="text-center mb-4">
                  <div className="inline-block bg-gradient-to-br from-orange-100 to-pink-100 rounded-full p-4 mb-3">
                    <div className="text-4xl">✨</div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">新しく作る</h2>
                  <p className="text-sm text-gray-500">科学的に正確な温度管理</p>
                </div>
                <button
                  onClick={() => setScreen('prepare')}
                  className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  調乳を始める 🚀
                </button>
              </div>
              
              {/* クイックスタート */}
              <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <h3 className="font-bold text-gray-800">クイックスタート</h3>
                    <p className="text-xs text-gray-600">前回と同じ設定で</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="bg-white px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                    140ml
                  </span>
                  <span className="bg-white px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                    ガラス瓶
                  </span>
                  <span className="bg-gradient-to-r from-cyan-100 to-blue-100 px-3 py-1.5 rounded-full text-sm font-semibold text-blue-700 shadow-sm">
                    🧊 氷水攪拌
                  </span>
                </div>
                <button
                  onClick={() => setScreen('guide')}
                  className="w-full bg-white text-purple-600 py-3 rounded-xl font-bold shadow hover:shadow-md transition-all border-2 border-purple-200 hover:border-purple-300"
                >
                  この設定で始める →
                </button>
              </div>
              
              {/* メニューカード */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setScreen('settings')}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 p-5 rounded-2xl hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">⚙️</div>
                  <p className="font-bold text-gray-800 text-sm">設定</p>
                  <p className="text-xs text-gray-600 mt-1">量や材質</p>
                </button>
                <button
                  onClick={() => setScreen('history')}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 p-5 rounded-2xl hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">📊</div>
                  <p className="font-bold text-gray-800 text-sm">履歴</p>
                  <p className="text-xs text-gray-600 mt-1">記録を見る</p>
                </button>
              </div>
              
              {/* ヒント */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-gray-800 mb-1">おすすめ冷却方法</p>
                  <p className="text-gray-600">氷水に浸けて軽く揺らすと約53秒で適温に！</p>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* 準備チェックリスト */}
        {screen === 'prepare' && (
          <>
            <div className="bg-gradient-to-r from-blue-400 to-cyan-400 p-6 text-white">
              <h2 className="text-xl font-bold text-center">事前準備</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">保冷剤を2-3個用意</p>
                    <p className="text-sm text-gray-600">冷凍庫で凍らせておく</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">ボウルを用意</p>
                    <p className="text-sm text-gray-600">哺乳瓶が浸かる深さのもの</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">湯冷ましを用意</p>
                    <p className="text-sm text-gray-600">冷蔵庫で冷やしておく(5°C)</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => setScreen('guide')}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-bold shadow-lg"
                >
                  準備完了 → 調乳開始
                </button>
                <button
                  onClick={() => setScreen('home')}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold"
                >
                  戻る
                </button>
              </div>
            </div>
          </>
        )}
        
        {/* 調乳ガイド */}
        {screen === 'guide' && (
          <>
            <div className="bg-gradient-to-r from-orange-400 to-red-400 p-6 text-white">
              <h2 className="text-xl font-bold text-center">調乳ガイド</h2>
              <p className="text-center text-sm mt-1 opacity-90">Step 1/2</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">☕</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">85°Cのお湯</h3>
                <div className="text-5xl font-bold text-orange-500 mb-2">80ml</div>
                <div className="w-32 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">粉ミルクを溶かします</p>
              </div>
              
              <button
                onClick={() => setScreen('guide2')}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold shadow-lg"
              >
                完了 → 次へ
              </button>
            </div>
          </>
        )}
        
        {screen === 'guide2' && (
          <>
            <div className="bg-gradient-to-r from-cyan-400 to-blue-400 p-6 text-white">
              <h2 className="text-xl font-bold text-center">調乳ガイド</h2>
              <p className="text-center text-sm mt-1 opacity-90">Step 2/2</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">💧</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">湯冷まし</h3>
                <div className="text-5xl font-bold text-blue-500 mb-2">60ml</div>
                <div className="w-32 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">140mlまで入れます</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">混合後の温度</p>
                <p className="text-3xl font-bold text-orange-600">約46.6°C</p>
              </div>
              
              <button
                onClick={() => setScreen('method')}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-bold shadow-lg"
              >
                完了 → 冷却方法を選ぶ
              </button>
            </div>
          </>
        )}
        
        {/* 冷却方法選択 */}
        {screen === 'method' && (
          <>
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-6 text-white">
              <h2 className="text-xl font-bold text-center">冷却方法を選ぶ</h2>
            </div>
            
            <div className="p-6 space-y-3">
              <div className="text-center mb-4">
                <Thermometer className="w-12 h-12 mx-auto text-orange-500 mb-2" />
                <p className="text-gray-600">現在: <span className="font-bold text-orange-600">46.6°C</span></p>
                <p className="text-gray-600">目標: <span className="font-bold text-green-600">38.0°C</span></p>
              </div>
              
              <button
                onClick={startTimer}
                className="w-full bg-gradient-to-br from-cyan-100 to-blue-100 border-2 border-cyan-300 p-5 rounded-2xl text-left hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">🧊</div>
                    <span className="font-bold text-gray-800 text-lg">氷水攪拌</span>
                  </div>
                  <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold">おすすめ</span>
                </div>
                <p className="text-sm text-gray-600 ml-8">予想時間: <span className="font-bold text-cyan-600">約53秒</span></p>
                <p className="text-xs text-gray-500 ml-8 mt-1">速くて節水、実用的</p>
              </button>
              
              <button className="w-full bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-4 rounded-xl text-left">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-xl">🧊</div>
                  <span className="font-semibold text-gray-800">氷水静置</span>
                </div>
                <p className="text-sm text-gray-600 ml-7">予想: 約3分 / 放置できて楽</p>
              </button>
              
              <button className="w-full bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-200 p-4 rounded-xl text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-800">流水冷却</span>
                </div>
                <p className="text-sm text-gray-600 ml-7">予想: 約40秒 / 速いが水道代</p>
              </button>
              
              <button
                onClick={() => setScreen('home')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold mt-4"
              >
                戻る
              </button>
            </div>
          </>
        )}
        
        {/* タイマー実行画面 */}
        {screen === 'timer' && (
          <>
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-bold">{formatTime(timer)}</span>
                </div>
                <span className="text-sm opacity-90">氷水攪拌モード</span>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 哺乳瓶ビジュアル */}
              <div className="text-center">
                <div className="inline-block relative">
                  <svg width="120" height="200" viewBox="0 0 120 200" className="mx-auto">
                    {/* 哺乳瓶の輪郭 */}
                    <rect x="30" y="20" width="60" height="10" fill="#ddd" rx="3" />
                    <rect x="45" y="10" width="30" height="20" fill="#eee" rx="2" />
                    
                    {/* 哺乳瓶本体 */}
                    <rect x="25" y="30" width="70" height="150" fill="white" stroke="#ccc" strokeWidth="2" rx="8" />
                    
                    {/* 温度に応じた液体グラデーション */}
                    <defs>
                      <linearGradient id="milkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={currentTemp >= 42 ? '#f97316' : currentTemp >= 40 ? '#fb923c' : currentTemp >= 38 ? '#fbbf24' : '#22c55e'} />
                        <stop offset="100%" stopColor={currentTemp >= 40 ? '#fb923c' : currentTemp >= 38 ? '#fbbf24' : '#22c55e'} />
                      </linearGradient>
                    </defs>
                    <rect x="28" y="35" width="64" height="140" fill="url(#milkGradient)" rx="6" />
                    
                    {/* 目盛り */}
                    <line x1="28" y1="95" x2="35" y2="95" stroke="#999" strokeWidth="1" />
                    <text x="15" y="98" fontSize="10" fill="#666">100ml</text>
                  </svg>
                  
                  <div className={`absolute -right-8 top-1/2 -translate-y-1/2 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${getTempColor(currentTemp)}`}>
                    {currentTemp.toFixed(1)}°
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-2">目標: 38.0°C まであと{(currentTemp - targetTemp).toFixed(1)}°</p>
              </div>
              
              {/* 進捗バー */}
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getTempColor(currentTemp)} transition-all duration-1000`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-600">
                  {progress < 100 ? '冷却中...' : '適温到達！'} ({progress.toFixed(0)}%)
                </p>
              </div>
              
              {/* 冷却速度 */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">冷却速度</p>
                <p className="text-2xl font-bold text-blue-600">
                  -{(k * (currentTemp - ambient)).toFixed(1)} °C/分
                </p>
              </div>
              
              {/* 揺らしリマインダー */}
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-300 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">次の揺らしまで</span>
                  <span className="text-2xl font-bold text-orange-600">{nextShake}秒</span>
                </div>
                
                <button
                  onClick={handleShake}
                  disabled={nextShake > 5}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                    nextShake <= 5 
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-xl active:scale-95' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {nextShake <= 5 ? '🤝 揺らした！' : '⏳ 待機中...'}
                </button>
                
                <p className="text-center text-sm text-gray-600 mt-2">
                  揺らした回数: <span className="font-bold text-orange-600">{shakeCount}回</span>
                </p>
              </div>
              
              {/* コントロールボタン */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="bg-gray-500 text-white py-3 rounded-xl font-semibold"
                >
                  {isRunning ? '一時停止' : '再開'}
                </button>
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setScreen('home');
                  }}
                  className="bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold"
                >
                  終了
                </button>
              </div>
            </div>
          </>
        )}
        
        {/* 完了画面 */}
        {screen === 'complete' && (
          <>
            <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-6 text-white">
              <h2 className="text-xl font-bold text-center">完了！</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">適温になりました！</h3>
                
                <div className="text-6xl font-bold text-green-600 my-4">
                  {currentTemp.toFixed(1)}°C
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-600">実際の時間: <span className="font-bold text-green-600">{formatTime(timer)}</span></p>
                  <p className="text-sm text-gray-600">予測: 0:53 (誤差 {Math.abs(timer - 53)}秒)</p>
                  <p className="text-sm text-gray-600">揺らした回数: {shakeCount}回</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-bold mb-1">必ず確認してください</p>
                  <p>腕の内側で温度を確認してから授乳してください</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => setScreen('home')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg"
                >
                  ホームに戻る
                </button>
                <button
                  onClick={() => {
                    setTimer(0);
                    setCurrentTemp(46.6);
                    setShakeCount(0);
                    setScreen('guide');
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold"
                >
                  もう一度作る
                </button>
              </div>
            </div>
          </>
        )}
        
        {/* 設定画面 */}
        {screen === 'settings' && (
          <>
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-6 text-white">
              <h2 className="text-xl font-bold text-center">設定</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">ミルク量</p>
                <div className="grid grid-cols-3 gap-2">
                  {[100, 120, 140, 160, 200, 240].map(v => (
                    <button
                      key={v}
                      onClick={() => setSettings({...settings, volume: v})}
                      className={`py-3 rounded-lg font-semibold ${
                        settings.volume === v 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-white text-gray-700 border border-gray-300'
                      }`}
                    >
                      {v}ml
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">哺乳瓶の材質</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSettings({...settings, material: 'glass'})}
                    className={`py-3 rounded-lg font-semibold ${
                      settings.material === 'glass' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    ガラス
                  </button>
                  <button
                    onClick={() => setSettings({...settings, material: 'plastic'})}
                    className={`py-3 rounded-lg font-semibold ${
                      settings.material === 'plastic' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    プラスチック
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">目標温度</p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="36"
                    max="40"
                    value={settings.targetTemp}
                    onChange={(e) => setSettings({...settings, targetTemp: parseInt(e.target.value)})}
                    className="flex-1"
                  />
                  <span className="font-bold text-2xl text-orange-600 w-16">{settings.targetTemp}°C</span>
                </div>
              </div>
              
              <button
                onClick={() => setScreen('home')}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-xl font-bold shadow-lg mt-6"
              >
                保存して戻る
              </button>
            </div>
          </>
        )}
        
        {/* 履歴画面 */}
        {screen === 'history' && (
          <>
            <div className="bg-gradient-to-r from-indigo-400 to-purple-400 p-6 text-white">
              <h2 className="text-xl font-bold text-center">履歴</h2>
            </div>
            
            <div className="p-6 space-y-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">2025/10/25 14:30</span>
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">完了</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-700">140ml / ガラス</p>
                  <p className="text-gray-700">氷水攪拌</p>
                  <p className="text-gray-700">予測: 0:53</p>
                  <p className="text-gray-700 font-semibold text-green-600">実際: 0:51</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">2025/10/25 11:15</span>
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">完了</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-700">140ml / ガラス</p>
                  <p className="text-gray-700">氷水攪拌</p>
                  <p className="text-gray-700">予測: 0:53</p>
                  <p className="text-gray-700 font-semibold text-green-600">実際: 0:55</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 mt-4">
                <p className="text-sm text-gray-600 mb-2">統計</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">平均時間</p>
                    <p className="text-lg font-bold text-purple-600">0:53</p>
                  </div>
                  <div>
                    <p className="text-gray-600">総調乳回数</p>
                    <p className="text-lg font-bold text-purple-600">24回</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setScreen('home')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold mt-6"
              >
                戻る
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
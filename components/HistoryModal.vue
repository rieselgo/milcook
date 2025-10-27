<script setup lang="ts">
import { computed } from 'vue';
import { useHistoryStore } from '~/stores/history';
import { useThermalEngine } from '~/composables/useThermalEngine';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const historyStore = useHistoryStore();
const { getMaterial, getCoolingMethod } = useThermalEngine();

const statistics = computed(() => historyStore.getStatistics());
const recentSessions = computed(() => historyStore.recentSessions);

const formatDate = (date: Date) => {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
};

const formatTime = (minutes: number | null) => {
  if (minutes === null) return '-';
  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);
  if (m > 0) {
    return `${m}分${s}秒`;
  }
  return `${s}秒`;
};
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click="emit('close')">
      <div class="modal-content" @click.stop>
        <!-- ヘッダー -->
        <header class="modal-header">
          <h2 class="modal-title">📊 調乳履歴</h2>
          <button class="close-button" @click="emit('close')" aria-label="履歴モーダルを閉じる">×</button>
        </header>

        <!-- 統計情報 -->
        <section v-if="statistics.totalSessions > 0" class="statistics">
          <div class="stat-card">
            <div class="stat-label">総回数</div>
            <div class="stat-value">{{ statistics.totalSessions }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">平均量</div>
            <div class="stat-value">{{ statistics.averageVolume }}<span class="unit">ml</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-label">平均時間</div>
            <div class="stat-value">{{ Math.round(statistics.averageActualTime) }}<span class="unit">分</span></div>
          </div>
        </section>

        <!-- 履歴リスト -->
        <section class="history-list">
          <h3 v-if="recentSessions.length === 0" class="empty-message">
            まだ履歴がありません
          </h3>
          <div
            v-for="session in recentSessions"
            :key="session.id"
            class="history-item"
          >
            <div class="item-header">
              <div class="item-date">{{ formatDate(session.startTime) }}</div>
              <div class="item-volume">{{ session.volume }}ml</div>
            </div>
            <div class="item-details">
              <span class="detail-tag">{{ getMaterial(session.materialId).name }}</span>
              <span class="detail-tag">{{ getCoolingMethod(session.coolingMethodId).name }}</span>
              <span class="detail-tag">{{ session.targetTemp }}°C</span>
            </div>
            <div class="item-times">
              <div class="time-item">
                <span class="time-label">予測:</span>
                <span class="time-value">{{ formatTime(session.predictedTime) }}</span>
              </div>
              <div class="time-item">
                <span class="time-label">実測:</span>
                <span class="time-value">{{ formatTime(session.actualTime) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- フッター -->
        <footer class="modal-footer">
          <button
            v-if="historyStore.hasHistory"
            class="clear-button"
            @click="() => { if (confirm('全ての履歴を削除しますか？')) historyStore.clearHistory(); }"
            aria-label="全ての調乳履歴を削除"
          >
            全削除
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-button:hover {
  background: #e0e0e0;
}

.statistics {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.stat-card {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.stat-label {
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #1976d2;
}

.stat-value .unit {
  font-size: 12px;
  font-weight: normal;
  margin-left: 2px;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-message {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 40px 20px;
}

.history-item {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-date {
  font-size: 13px;
  color: #666;
}

.item-volume {
  font-size: 16px;
  font-weight: bold;
  color: #2196f3;
}

.item-details {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.detail-tag {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  color: #666;
}

.item-times {
  display: flex;
  gap: 12px;
}

.time-item {
  flex: 1;
  font-size: 12px;
}

.time-label {
  color: #999;
  margin-right: 4px;
}

.time-value {
  color: #333;
  font-weight: 600;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.clear-button {
  background: white;
  border: 2px solid #f44336;
  color: #f44336;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-button:hover {
  background: #f44336;
  color: white;
}

/* トランジション */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

@media (max-width: 480px) {
  .statistics {
    grid-template-columns: 1fr;
  }
}
</style>

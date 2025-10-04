import React, { useState, useEffect, useCallback } from 'react';

interface ProjectSettings {
  authorName: string;
  durationDays: number;
  startDate: string;
  deadline: string;
  isCompleted?: boolean;
  completionType?: 'success' | 'deadline';
}

const getDaysRemaining = (deadline: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline + 'T00:00:00');
  deadlineDate.setHours(0, 0, 0, 0);
  const diffTime = deadlineDate.getTime() - today.getTime();
  if (diffTime < 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const PROGRESS_STEPS = ['準備', 'シナリオ制作', 'シナリオ合格', '画像作成', '画像合格'];
const HEALTH_LEVELS = [
  { value: 1, label: '😫', description: '体調悪い' },
  { value: 2, label: '😰', description: '少し疲れ' },
  { value: 3, label: '😊', description: '普通' },
  { value: 4, label: '😄', description: '良好' },
  { value: 5, label: '🔥', description: '最高' },
];

export default function App() {
  const [projectSettings, setProjectSettings] = useState<ProjectSettings | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState<string | null>(null);
  const [selectedHealth, setSelectedHealth] = useState(3);
  const [checkedProgress, setCheckedProgress] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('aiMangaSupporter_settings');
    if (saved) setProjectSettings(JSON.parse(saved));
  }, []);

  const saveSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const authorName = formData.get('authorName') as string;
    const startDate = formData.get('startDate') as string;
    const durationDays = Number(formData.get('durationDays'));

    const deadline = new Date(startDate);
    deadline.setDate(deadline.getDate() + durationDays - 1);

    const newSettings: ProjectSettings = {
      authorName,
      durationDays,
      startDate,
      deadline: deadline.toISOString().split('T')[0],
    };

    setProjectSettings(newSettings);
    localStorage.setItem('aiMangaSupporter_settings', JSON.stringify(newSettings));
    setIsSettingsOpen(false);
  };

  const handleRecord = () => {
  if (!projectSettings) return;
  const progress = Array.from(checkedProgress);
  const remainingDays = getDaysRemaining(projectSettings.deadline);
  
  if (progress.includes('画像合格')) {
    setProjectSettings({ ...projectSettings, isCompleted: true, completionType: 'success' });
    localStorage.setItem('aiMangaSupporter_settings', JSON.stringify({ ...projectSettings, isCompleted: true, completionType: 'success' }));
    return;
  }

  if (remainingDays <= 0) {
    setProjectSettings({ ...projectSettings, isCompleted: true, completionType: 'deadline' });
    localStorage.setItem('aiMangaSupporter_settings', JSON.stringify({ ...projectSettings, isCompleted: true, completionType: 'deadline' }));
    return;
  }

  const progressLevel = Math.max(
    progress.includes('画像作成') ? 4 : 0,
    progress.includes('シナリオ合格') ? 3 : 0,
    progress.includes('シナリオ制作') ? 2 : 0,
    progress.includes('準備') ? 1 : 0
  );

  const healthLabel = HEALTH_LEVELS.find(h => h.value === selectedHealth)?.description || '普通';
  let message = '';

  if (remainingDays <= 3 && progressLevel < 4) {
    message = `${projectSettings.authorName}さん、残り${remainingDays}日です！緊急事態です！全力で追い込みましょう！`;
  } else if (remainingDays <= 10 && progressLevel < 3) {
    message = `${projectSettings.authorName}さん、残り${remainingDays}日です。急いでシナリオを進めましょう！`;
  } else if (remainingDays <= 10 && progressLevel === 3) {
    message = `残り${remainingDays}日、シナリオ合格おめでとうございます！すぐに画像作成に取りかかりましょう。`;
  } else if (progressLevel >= 3) {
    message = `${projectSettings.authorName}さん、素晴らしいです！シナリオ合格、理想的なペースです！`;
  } else if (progressLevel === 2) {
    message = `シナリオ制作中ですね。残り${remainingDays}日、順調なペースです。頑張りましょう！`;
  } else {
    message = `${projectSettings.authorName}さん、今日も制作お疲れ様です。体調は${healthLabel}ですね。残り${remainingDays}日、着実に進めましょう！`;
  }

  setMotivationalMessage(message);
  setCheckedProgress(new Set());
};

  if (projectSettings?.isCompleted) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
        <h1 style={{ fontSize: '36px', color: '#fbbf24', marginBottom: '20px' }}>完成おめでとうございます！</h1>
        <button onClick={() => { setProjectSettings(null); localStorage.clear(); }} style={{ background: '#fbbf24', color: '#000', padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>新しいプロジェクト</button>
      </div>
    );
  }

  if (!projectSettings) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '20px' }}>
        <svg style={{ width: '80px', height: '80px', fill: '#fbbf24', marginBottom: '30px' }} viewBox="0 0 24 24">
          <path d="M6 2h12v6l-6 6 6 6v6H6v-6l6-6-6-6V2z" />
        </svg>
        <h1 style={{ fontSize: '48px', color: '#fbbf24', marginBottom: '20px' }}>帝国の砂時計</h1>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>制作の進捗を記録して、ゴールまで走り抜けよう！</p>
        <button onClick={() => setIsSettingsOpen(true)} style={{ background: '#fbbf24', color: '#000', padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>さっそく始める (初期設定)</button>
      </div>
    );
  }

  const remainingDays = getDaysRemaining(projectSettings.deadline);
  const [year, month, day] = projectSettings.deadline.split('-').map(Number);
  const formattedDeadline = `${year}年${month}月${day}日`;

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <svg onClick={() => setIsSettingsOpen(true)} style={{ width: '60px', height: '60px', fill: '#fbbf24', margin: '0 auto 10px', cursor: 'pointer' }} viewBox="0 0 24 24">
            <path d="M6 2h12v6l-6 6 6 6v6H6v-6l6-6-6-6V2z" />
          </svg>
          <p style={{ fontSize: '18px' }}>{formattedDeadline} まで</p>
          <p style={{ fontSize: '36px', color: '#fbbf24', fontWeight: 'bold' }}>残り {remainingDays} 日</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', padding: '30px', color: '#000' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>今日の体調</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px' }}>
            {HEALTH_LEVELS.map(({ value, label }) => (
              <button key={value} onClick={() => setSelectedHealth(value)} style={{ background: selectedHealth === value ? '#fbbf24' : '#f3f4f6', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '24px', cursor: 'pointer' }}>{label}</button>
            ))}
          </div>

          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>今日の工程</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
            {PROGRESS_STEPS.map(step => (
              <button key={step} onClick={() => setCheckedProgress(prev => { const newSet = new Set(prev); newSet.has(step) ? newSet.delete(step) : newSet.add(step); return newSet; })} style={{ background: checkedProgress.has(step) ? '#fbbf24' : '#fff', color: checkedProgress.has(step) ? '#fff' : '#000', border: '2px solid #d1d5db', borderRadius: '8px', padding: '12px 20px', cursor: 'pointer', fontWeight: '500' }}>{step}</button>
            ))}
          </div>

          <button onClick={handleRecord} style={{ width: '100%', background: '#fbbf24', color: '#fff', padding: '16px', border: 'none', borderRadius: '8px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>記録する</button>
        </div>
      </div>

      {isSettingsOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '30px', maxWidth: '500px', width: '100%', color: '#000' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>プロジェクト設定</h2>
            <form onSubmit={saveSettings}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>作者名</label>
                <input name="authorName" required style={{ width: '100%', padding: '8px', border: '2px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>制作開始日</label>
                <input name="startDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required style={{ width: '100%', padding: '8px', border: '2px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>制作期間（日数）</label>
                <input name="durationDays" type="number" defaultValue={60} required min={1} style={{ width: '100%', padding: '8px', border: '2px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setIsSettingsOpen(false)} style={{ flex: 1, padding: '12px', background: '#d1d5db', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>キャンセル</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#fbbf24', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {motivationalMessage && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
    <div style={{ background: '#fff', borderRadius: '16px', padding: '30px', maxWidth: '500px', color: '#000' }}>
      <h2 style={{ color: '#fbbf24', textAlign: 'center', marginBottom: '20px' }}>今日のエール</h2>
      <p style={{ marginBottom: '20px' }}>{motivationalMessage}</p>
      <button onClick={() => setMotivationalMessage(null)} style={{ width: '100%', background: '#fbbf24', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>閉じる</button>
    </div>
  </div>
)}
    </div>
  );
}
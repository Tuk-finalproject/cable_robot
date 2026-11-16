import { useEffect, useState } from 'react';
import { ArrowRight, CloudDownload, Database, RotateCcw } from 'lucide-react';

export type SavedMap = {
  id: string;
  name: string;
  version: number;
  created_at: string;
  image_url: string;
  width: number | null;
  height: number | null;
};

type LoadState = 'loading' | 'ready' | 'empty' | 'unavailable';

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '');

export function savedMapImageUrl(map: SavedMap) {
  return `${apiBaseUrl}${map.image_url}`;
}

export default function SavedMapsPanel({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (map: SavedMap | null) => void;
}) {
  const [maps, setMaps] = useState<SavedMap[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [message, setMessage] = useState('저장된 지도를 불러오는 중입니다.');

  async function loadMaps() {
    if (!apiBaseUrl || (location.protocol === 'https:' && apiBaseUrl.startsWith('http:'))) {
      setState('unavailable');
      setMessage('서비스 서버 연결 전');
      return;
    }
    setState('loading');
    setMessage('저장된 지도를 불러오는 중입니다.');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${apiBaseUrl}/api/maps`, {
        signal: controller.signal,
        credentials: 'omit',
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`지도 목록을 불러오지 못했습니다. (${response.status})`);
      const body: unknown = await response.json();
      if (!Array.isArray(body)) throw new Error('지도 목록의 형식이 올바르지 않습니다.');
      const records = body as SavedMap[];
      setMaps(records);
      setState(records.length ? 'ready' : 'empty');
      setMessage(records.length ? `저장된 지도 ${records.length}개` : '저장된 지도가 없습니다. 로봇에서 지도를 저장하면 여기에 표시됩니다.');
      onSelect(records[0] ?? null);
    } catch (error) {
      setState('unavailable');
      setMessage(error instanceof Error && error.name !== 'AbortError' ? error.message : '지도 서버 응답이 지연되고 있습니다.');
    } finally {
      window.clearTimeout(timeout);
    }
  }

  useEffect(() => { void loadMaps(); }, []); // 대시보드 진입 시 한 번 조회

  return (
    <aside className="surface saved-maps-panel" aria-labelledby="saved-maps-title">
      <div className="saved-maps-heading">
        <div><p className="section-kicker">SAVED MAPS</p><h2 id="saved-maps-title">저장된 지도</h2></div>
        <button className="refresh-button" type="button" onClick={() => void loadMaps()} aria-label="지도 목록 새로고침" disabled={state === 'loading'}><RotateCcw size={17} /></button>
      </div>
      {state === 'ready' ? (
        <div className="saved-map-list" role="list" aria-label="저장된 지도 목록">
          {maps.map((map) => (
            <button className={`saved-map-item ${selectedId === map.id ? 'selected' : ''}`} type="button" key={map.id} role="listitem" onClick={() => onSelect(map)}>
              <span className="saved-map-icon"><Database size={18} /></span>
              <span className="saved-map-details"><strong>{map.name}</strong><small>버전 {map.version} · {new Date(map.created_at).toLocaleDateString('ko-KR')}</small></span>
              <ArrowRight size={16} />
            </button>
          ))}
        </div>
      ) : (
        <div className={`saved-map-empty ${state === 'loading' ? 'saved-map-empty--loading' : ''}`}>
          <span><CloudDownload size={25} /></span>
          <strong>{state === 'loading' ? '지도를 불러오는 중' : state === 'empty' ? '저장된 지도 없음' : '지도 연결 대기'}</strong>
          <p>{message}</p>
        </div>
      )}
      {state === 'ready' && <div className="saved-maps-foot"><span className="status-indicator" /> {message}</div>}
    </aside>
  );
}

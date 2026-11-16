import { useState, type PointerEvent } from 'react';
import {
  ArrowRight,
  Check,
  Compass,
  RotateCcw,
  Route,
  Save,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import SavedMapsPanel, { savedMapImageUrl, type SavedMap } from './SavedMapsPanel';

type View = 'overview' | 'route';
type Point = { x: number; y: number };
type SavedDraft = { waypoints: Point[]; savedAt: number };

const STORAGE_KEY = 'cableworm-demo-route-v1';
const START: Point = { x: 86, y: 370 };
const GOAL: Point = { x: 670, y: 104 };
const EXAMPLE_WAYPOINTS: Point[] = [
  { x: 196, y: 370 },
  { x: 280, y: 315 },
  { x: 426, y: 312 },
  { x: 554, y: 202 },
];
const OBSTACLES = [
  { x: 168, y: 110, width: 126, height: 112 },
  { x: 358, y: 144, width: 124, height: 110 },
  { x: 552, y: 296, width: 102, height: 92 },
];

function loadDraft(): SavedDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as SavedDraft;
    if (!Array.isArray(draft.waypoints) || typeof draft.savedAt !== 'number') return null;
    const valid = draft.waypoints.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
    return valid ? draft : null;
  } catch {
    return null;
  }
}

function pointString(points: Point[]) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function isBlocked(point: Point) {
  return OBSTACLES.some(
    ({ x, y, width, height }) =>
      point.x >= x - 12 &&
      point.x <= x + width + 12 &&
      point.y >= y - 12 &&
      point.y <= y + height + 12,
  );
}

function RouteMap({
  waypoints,
  onAddPoint,
  interactive = false,
}: {
  waypoints: Point[];
  onAddPoint?: (point: Point) => void;
  interactive?: boolean;
}) {
  const route = [START, ...waypoints, GOAL];

  function handlePointer(event: PointerEvent<SVGSVGElement>) {
    if (!interactive || !onAddPoint) return;
    const svg = event.currentTarget;
    const transform = svg.getScreenCTM();
    if (!transform) return;
    const position = svg.createSVGPoint();
    position.x = event.clientX;
    position.y = event.clientY;
    const point = position.matrixTransform(transform.inverse());
    onAddPoint({ x: Math.round(point.x), y: Math.round(point.y) });
  }

  return (
    <div className={`map-shell ${interactive ? 'map-shell--interactive' : ''}`}>
      <svg
        viewBox="0 0 760 470"
        role="img"
        aria-label="출발점과 도착점, 장애물 및 경유점이 있는 시연용 지도"
        onPointerDown={handlePointer}
      >
        <defs>
          <pattern id="map-grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#dce7e9" strokeWidth="1" />
          </pattern>
          <linearGradient id="route-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#0a9d92" />
            <stop offset="1" stopColor="#2a73e2" />
          </linearGradient>
        </defs>
        <rect width="760" height="470" fill="#f6faf9" />
        <rect width="760" height="470" fill="url(#map-grid)" />
        <path d="M45 55 H713 V415 H45 Z" fill="none" stroke="#8ba4ad" strokeWidth="11" strokeLinejoin="round" />
        <path d="M45 250 H110 M320 55 V95 M710 260 H655" stroke="#8ba4ad" strokeWidth="8" />
        <rect x="168" y="110" width="126" height="112" rx="12" fill="#dce6e8" stroke="#a7bdc2" strokeWidth="2" />
        <rect x="358" y="144" width="124" height="110" rx="12" fill="#dce6e8" stroke="#a7bdc2" strokeWidth="2" />
        <rect x="552" y="296" width="102" height="92" rx="12" fill="#dce6e8" stroke="#a7bdc2" strokeWidth="2" />
        <text x="231" y="171" textAnchor="middle" className="map-obstacle-label">장애물</text>
        <text x="420" y="204" textAnchor="middle" className="map-obstacle-label">장애물</text>
        <text x="603" y="346" textAnchor="middle" className="map-obstacle-label">장애물</text>
        <polyline points={pointString(route)} fill="none" stroke="#fff" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={pointString(route)} fill="none" stroke="url(#route-gradient)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        {waypoints.map((point, index) => (
          <g key={`${point.x}-${point.y}-${index}`}>
            <circle cx={point.x} cy={point.y} r="16" fill="#fff" stroke="#0a9d92" strokeWidth="4" />
            <text x={point.x} y={point.y + 5} textAnchor="middle" className="map-point-label">{index + 1}</text>
          </g>
        ))}
        <circle cx={START.x} cy={START.y} r="19" fill="#0b6f6c" stroke="#fff" strokeWidth="5" />
        <circle cx={GOAL.x} cy={GOAL.y} r="19" fill="#234b87" stroke="#fff" strokeWidth="5" />
        <text x={START.x} y={START.y - 31} textAnchor="middle" className="map-endpoint-label">출발</text>
        <text x={GOAL.x} y={GOAL.y - 31} textAnchor="middle" className="map-endpoint-label">도착</text>
      </svg>
      <div className="map-corner"><span className="map-corner-dot" /> SAMPLE MAP <span className="map-corner-version">v0.1</span></div>
    </div>
  );
}

const navigation = [
  { id: 'overview' as const, label: '대시보드', icon: Compass },
  { id: 'route' as const, label: '지도·경로', icon: Route },
];

function App() {
  const [view, setView] = useState<View>('overview');
  const [initialDraft] = useState(loadDraft);
  const [waypoints, setWaypoints] = useState<Point[]>(initialDraft?.waypoints ?? EXAMPLE_WAYPOINTS);
  const [savedAt, setSavedAt] = useState<number | null>(initialDraft?.savedAt ?? null);
  const [hint, setHint] = useState('');
  const [selectedMap, setSelectedMap] = useState<SavedMap | null>(null);
  const [mapImageFailed, setMapImageFailed] = useState(false);

  function goTo(next: View) {
    setView(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function addPoint(point: Point) {
    if (point.x < 68 || point.x > 692 || point.y < 73 || point.y > 398) {
      setHint('지도 경계 안쪽을 눌러 경유점을 추가하세요.');
      return;
    }
    if (isBlocked(point)) {
      setHint('장애물 위에는 경유점을 놓을 수 없습니다.');
      return;
    }
    if (waypoints.length >= 10) {
      setHint('경유점은 최대 10개까지 추가할 수 있습니다.');
      return;
    }
    setWaypoints((current) => [...current, point]);
    setSavedAt(null);
    setHint('경유점이 추가되었습니다. 경로를 저장하면 이 브라우저에 보관됩니다.');
  }

  function updatePoints(next: Point[], message: string) {
    setWaypoints(next);
    setSavedAt(null);
    setHint(message);
  }

  function saveDraft() {
    const saved = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ waypoints, savedAt: saved } satisfies SavedDraft));
    setSavedAt(saved);
    setHint('경로 초안을 이 브라우저에 저장했습니다. 로봇에는 아직 전송되지 않았습니다.');
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" type="button" onClick={() => goTo('overview')} aria-label="CableWorm 대시보드">
            <span className="brand-mark"><Route size={23} strokeWidth={2.7} /></span>
            <span className="brand-word">Cable<span>Worm</span><small>FIELD CONSOLE</small></span>
          </button>
          <nav className="desktop-nav" aria-label="주 메뉴">
            {navigation.map(({ id, label }) => <button key={id} className={view === id ? 'active' : ''} onClick={() => goTo(id)} type="button">{label}</button>)}
          </nav>
          <div className="topbar-actions"><span className="connection-pill"><span /> 장치 연결 전</span></div>
        </div>
      </header>

      <main>
        {view === 'overview' && (
          <>
            <section className="dashboard-heading page-width"><h1>대시보드</h1><span className="demo-badge">화면 시연</span></section>

            <section className="section page-width overview-grid" aria-label="지도 미리보기와 저장된 지도">
              <div className="surface map-preview">
                <div className="surface-header"><h2>{selectedMap ? selectedMap.name : '지도 미리보기'}</h2><span className="demo-badge">{selectedMap ? '저장된 지도' : '샘플 지도'}</span></div>
                {selectedMap && !mapImageFailed ? <div className="stored-map-shell"><img src={savedMapImageUrl(selectedMap)} alt={`${selectedMap.name} 지도`} onError={() => setMapImageFailed(true)} /></div> : mapImageFailed ? <div className="stored-map-error">Blob Storage에서 지도 이미지를 열지 못했습니다. 지도 목록을 새로고침해 주세요.</div> : <RouteMap waypoints={waypoints} />}
                <div className="surface-footer"><div><strong>{selectedMap ? `버전 ${selectedMap.version}` : `경유점 ${waypoints.length}개`}</strong></div><button className="text-button" type="button" onClick={() => goTo('route')}>샘플 경로 편집 <ArrowRight size={17} /></button></div>
              </div>
              <SavedMapsPanel selectedId={selectedMap?.id ?? null} onSelect={(map) => { setSelectedMap(map); setMapImageFailed(false); }} />
            </section>
          </>
        )}

        {view === 'route' && (
          <section className="workspace page-width">
            <div className="page-intro"><h1>경로 편집</h1><span className="demo-badge">샘플 지도</span></div>
            <div className="route-layout">
              <div className="surface route-map-card"><div className="map-toolbar"><div><span className="live-dot" /> 샘플 지도 <span className="toolbar-separator">/</span> 경유점 {waypoints.length}개</div><span>지도를 눌러 경유점 추가</span></div><RouteMap waypoints={waypoints} interactive onAddPoint={addPoint} /><div className="map-legend"><span><i className="legend-start" /> 출발</span><span><i className="legend-route" /> 사용자 경로</span><span><i className="legend-obstacle" /> 장애물</span><span><i className="legend-goal" /> 도착</span></div></div>
              <aside className="surface editor-panel"><div className="editor-header"><h2>경유점</h2><span className="count-badge">{waypoints.length} POINTS</span></div><div className="waypoint-list"><div className="waypoint-item waypoint-item--fixed"><span className="waypoint-marker start-marker" /><div><strong>출발점</strong><small>로봇 투입 위치</small></div><span>START</span></div>{waypoints.map((point, index) => <div className="waypoint-item" key={`${point.x}-${point.y}-${index}`}><span className="waypoint-marker">{index + 1}</span><div><strong>경유점 {index + 1}</strong><small>지도 좌표 {point.x}, {point.y}</small></div><button type="button" aria-label={`경유점 ${index + 1} 삭제`} onClick={() => updatePoints(waypoints.filter((_, i) => i !== index), '경유점을 삭제했습니다.')}><X size={16} /></button></div>)}<div className="waypoint-item waypoint-item--fixed"><span className="waypoint-marker goal-marker" /><div><strong>도착점</strong><small>견인선 설치 목표</small></div><span>GOAL</span></div></div><div className="editor-tools"><button type="button" onClick={() => updatePoints(waypoints.slice(0, -1), '마지막 경유점을 취소했습니다.')} disabled={!waypoints.length}><Undo2 size={16} /> 마지막 점 취소</button><button type="button" onClick={() => updatePoints(EXAMPLE_WAYPOINTS, '예시 경로를 불러왔습니다.')}><RotateCcw size={16} /> 예시 경로</button><button type="button" onClick={() => updatePoints([], '경유점을 모두 지웠습니다.')} disabled={!waypoints.length}><Trash2 size={16} /> 모두 지우기</button></div><button className="save-button" type="button" onClick={saveDraft}><Save size={18} /> 경로 초안 저장</button>{hint && <div className="editor-hint" role="status">{savedAt && <Check size={16} />}{hint}</div>}</aside>
            </div>
          </section>
        )}

      </main>

      <footer className="site-footer"><div className="page-width"><span><strong>CableWorm</strong> / 현장 작업 콘솔</span><span>탐색 · 경로 승인 · 견인선 설치</span></div></footer>
      <nav className="bottom-nav" aria-label="휴대폰 주 메뉴">{navigation.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={view === id ? 'active' : ''} onClick={() => goTo(id)}><Icon size={21} strokeWidth={view === id ? 2.4 : 1.8} /><span>{label}</span></button>)}</nav>
    </div>
  );
}

export default App;

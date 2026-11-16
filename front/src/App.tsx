import { useState } from 'react';
import { Map, Route } from 'lucide-react';
import SavedMapsPanel, { savedMapImageUrl, type SavedMap } from './SavedMapsPanel';

export default function App() {
  const [selectedMap, setSelectedMap] = useState<SavedMap | null>(null);
  const [mapImageFailed, setMapImageFailed] = useState(false);

  function selectMap(map: SavedMap | null) {
    setSelectedMap(map);
    setMapImageFailed(false);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="page-width topbar-inner">
          <div className="brand" aria-label="CableWorm">
            <span className="brand-mark"><Route size={23} strokeWidth={2.6} /></span>
            <span className="brand-word">Cable<span>Worm</span><small>FIELD CONSOLE</small></span>
          </div>
          <span className="connection-pill"><span /> 장치 연결 전</span>
        </div>
      </header>

      <main className="page-width dashboard">
        <h1>대시보드</h1>
        <div className="dashboard-grid">
          <section className="surface map-viewer" aria-labelledby="map-viewer-title">
            <div className="surface-heading">
              <h2 id="map-viewer-title">지도</h2>
              {selectedMap && <span className="map-version">버전 {selectedMap.version}</span>}
            </div>
            {selectedMap && !mapImageFailed ? (
              <div className="map-image-wrap">
                <img src={savedMapImageUrl(selectedMap)} alt={`${selectedMap.name} 지도`} onError={() => setMapImageFailed(true)} />
              </div>
            ) : (
              <div className="map-placeholder">
                <span className="placeholder-icon"><Map size={30} strokeWidth={1.7} /></span>
                <strong>{mapImageFailed ? '지도 이미지를 열 수 없음' : '선택된 지도 없음'}</strong>
              </div>
            )}
            {selectedMap && <div className="map-caption"><strong>{selectedMap.name}</strong><span>{new Date(selectedMap.created_at).toLocaleDateString('ko-KR')}</span></div>}
          </section>
          <SavedMapsPanel selectedId={selectedMap?.id ?? null} onSelect={selectMap} />
        </div>
      </main>
    </div>
  );
}

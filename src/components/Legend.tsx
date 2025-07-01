import React from 'react';

export type HighlightMode = 'cost' | 'time' | 'none';

interface LegendProps {
  onHighlightModeChange: (mode: HighlightMode) => void;
  currentMode: HighlightMode;
  onReorganizeLayout?: () => void;
  onClearTree?: () => void;
}

const Legend: React.FC<LegendProps> = ({ onHighlightModeChange, currentMode, onReorganizeLayout, onClearTree }) => {
  const legendItems = [
    { color: '#00ee00', label: 'Default (No Highlight)', mode: 'none' as HighlightMode },
    { color: '#1e90ff', label: 'Minimum Cost', mode: 'cost' as HighlightMode },
    { color: '#ffde21', label: 'Minimum Time', mode: 'time' as HighlightMode },
  ];

  return (
    <div 
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
        zIndex: 1000,
        minWidth: '200px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
      }}
    >
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Node Highlighting</h3>
      
      {legendItems.map((item) => (
        <div key={item.mode} style={{ marginBottom: '6px' }}>
          <button
            onClick={() => onHighlightModeChange(item.mode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              background: currentMode === item.mode ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              border: currentMode === item.mode ? '1px solid white' : '1px solid transparent',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (currentMode !== item.mode) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentMode !== item.mode) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: item.color,
                borderRadius: '2px',
                marginRight: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            />
            {item.label}
            {currentMode === item.mode && (
              <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✓</span>
            )}
          </button>
        </div>
      ))}
      
      <div style={{ 
        marginTop: '8px', 
        paddingTop: '8px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.3)',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        Click to toggle highlighting mode
      </div>
      
      {onReorganizeLayout && (
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
          <button
            onClick={onReorganizeLayout}
            style={{
              width: '100%',
              background: 'rgba(100, 150, 255, 0.2)',
              border: '1px solid rgba(100, 150, 255, 0.5)',
              color: 'white',
              padding: '6px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s ease',
              marginBottom: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(100, 150, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(100, 150, 255, 0.2)';
            }}
          >
            📐 Reorganize Layout
          </button>
        </div>
      )}
      
      {onClearTree && (
        <div style={{ marginTop: onReorganizeLayout ? '0px' : '8px', paddingTop: onReorganizeLayout ? '0px' : '8px', borderTop: onReorganizeLayout ? 'none' : '1px solid rgba(255, 255, 255, 0.3)' }}>
          <button
            onClick={onClearTree}
            style={{
              width: '100%',
              background: 'rgba(255, 100, 100, 0.2)',
              border: '1px solid rgba(255, 100, 100, 0.5)',
              color: 'white',
              padding: '6px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 100, 100, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 100, 100, 0.2)';
            }}
          >
            🗑️ Clear Tree
          </button>
        </div>
      )}
    </div>
  );
};

export default Legend;

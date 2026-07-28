export default function Modal({ titulo, children, onCerrar, ancho = 760 }) {
  return (
    <div className="modal-backdrop" onMouseDown={onCerrar}>
      <div
        className="modal"
        style={{ width: `min(${ancho}px, 100%)` }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button className="icon-button" onClick={onCerrar}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

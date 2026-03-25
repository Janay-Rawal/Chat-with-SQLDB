export default function TypingIndicator() {
  return (
    <div className="typing-bubble">
      <div className="avatar bot">λ</div>
      <div className="bubble bot" style={{ padding: 0 }}>
        <div className="dot-row">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
      </div>
    </div>
  );
}
export default function TypingIndicator({ message = "Thinking..." }) {
  return (
    <div className="message-row assistant indicator-row">
      <div className="avatar">λ</div>
      <div className="indicator-content">
        <div className="indicator-spinner">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
        <span className="indicator-text">{message}</span>
      </div>
    </div>
  );
}
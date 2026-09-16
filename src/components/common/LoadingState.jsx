function LoadingState({ className = '', message = '불러오는 중입니다.' }) {
  return (
    <div className={className} role="status" aria-live="polite">
      {message}
    </div>
  );
}

export default LoadingState;

function ErrorState({ className = '', message = '요청 처리 중 오류가 발생했습니다.' }) {
  return (
    <div className={className} role="alert">
      {message}
    </div>
  );
}

export default ErrorState;

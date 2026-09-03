function Button({ children, type = 'button', onClick, disabled = false }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;

// 미사용코드 쓸거면 쓰고 아님 나중에 지워야함

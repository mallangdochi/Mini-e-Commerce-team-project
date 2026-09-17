import { useEffect } from 'react';

function ConfirmModal({
  open,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onClose,
  titleId = 'confirmModalTitle',
  backdropClassName,
  modalClassName,
  icon,
  iconClassName,
  actionsClassName,
  cancelClassName,
  confirmClassName,
  children,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className={backdropClassName} onClick={onClose}>
      <section
        className={modalClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        {icon && (
          <div className={iconClassName} aria-hidden="true">
            {icon}
          </div>
        )}

        <h2 id={titleId}>{title}</h2>
        {description && <p>{description}</p>}
        {children}

        <div className={actionsClassName}>
          <button type="button" className={cancelClassName} onClick={onClose}>
            {cancelText}
          </button>
          <button type="button" className={confirmClassName} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmModal;

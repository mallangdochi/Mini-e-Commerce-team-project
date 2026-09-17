function EmptyState({
  className = '',
  message = '',
  icon = null,
  title = '',
  description = '',
  action = null,
}) {
  const isSimple = message && !icon && !title && !description && !action;

  return (
    <div className={className}>
      {isSimple ? (
        message
      ) : (
        <>
          {icon}
          {title && <strong>{title}</strong>}
          {description && <span>{description}</span>}
          {action}
        </>
      )}
    </div>
  );
}

export default EmptyState;

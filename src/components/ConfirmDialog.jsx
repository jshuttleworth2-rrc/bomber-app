import './ConfirmDialog.css';

const ConfirmDialog = ({
  isOpen,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel} onKeyDown={handleKeyDown}>
      <div className="confirm-dialog-content" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>

        <div className="confirm-buttons">
          <button onClick={onConfirm} className="btn-confirm-primary">
            {confirmText}
          </button>
          <button onClick={onCancel} className="btn-confirm-secondary">
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

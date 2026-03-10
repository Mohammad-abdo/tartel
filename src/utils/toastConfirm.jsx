import { toast } from 'react-toastify';

/**
 * Show a react-toastify confirmation toast with action buttons.
 * @param {object} opts
 * @param {string} opts.title        - Bold heading
 * @param {string} [opts.description] - Smaller subtext
 * @param {string} [opts.confirmLabel] - Button text (default "تأكيد")
 * @param {string} [opts.cancelLabel]  - Button text (default "إلغاء")
 * @param {'warn'|'error'|'info'} [opts.type] - Toast colour (default "warn")
 * @param {() => void|Promise<void>} opts.onConfirm - Called when user confirms
 */
export function toastConfirm({
  title,
  description,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  type = 'warn',
  confirmStyle,
  onConfirm,
}) {
  const render = ({ closeToast }) => (
    <div>
      <p style={{ fontWeight: 600, marginBottom: description ? 4 : 10 }}>{title}</p>
      {description && (
        <p style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>{description}</p>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={async () => {
            closeToast();
            if (onConfirm) await onConfirm();
          }}
          style={{
            padding: '6px 16px',
            background: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
            ...confirmStyle,
          }}
        >
          {confirmLabel}
        </button>
        <button
          onClick={() => closeToast()}
          style={{
            padding: '6px 16px',
            background: '#e5e7eb',
            color: '#374151',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );

  const fn = type === 'error' ? toast.error : type === 'info' ? toast.info : toast.warn;
  fn(render, { autoClose: false, closeOnClick: false });
}

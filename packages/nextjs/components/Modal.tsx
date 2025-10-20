import { useEffect } from 'react';
import { useAppStore } from '~~/store/useAppStore';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const Modal = () => {
  const { modal, closeModal } = useAppStore();

  useEffect(() => {
    if (modal.isOpen && modal.type === 'loading') {
      // Auto-dismiss loading after 2s if still open
      const timer = setTimeout(() => {
        if (modal.type === 'loading') {
          closeModal();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (modal.isOpen && (modal.type === 'success' || modal.type === 'error')) {
      // Auto-dismiss success/error after 3s
      const timer = setTimeout(() => {
        closeModal();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modal.isOpen, modal.type, closeModal]);

  if (!modal.isOpen) return null;

  const isLoading = modal.type === 'loading';
  const isSuccess = modal.type === 'success';
  const isError = modal.type === 'error';

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-curl"
      style={{ backdropFilter: 'blur(4px)', backgroundColor: 'hsl(25 35% 13% / 0.3)' }}
      onClick={isLoading ? undefined : closeModal}
    >
      <div
        className={`
          relative w-full max-w-[500px] rounded-[2px] bg-background
          border-2 border-dashed border-secondary p-6 shadow-emboss
          paper-texture
          ${isError ? 'border-destructive animate-shake' : ''}
          ${isSuccess ? 'border-primary' : ''}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {isLoading && (
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          )}
          {isSuccess && (
            <CheckCircle2 className="w-6 h-6 text-primary animate-stamp" />
          )}
          {isError && (
            <XCircle className="w-6 h-6 text-destructive" />
          )}

          <h3 className="font-mono text-xl text-foreground uppercase tracking-wider">
            {isLoading && 'PROCESSING...'}
            {isSuccess && 'STAMPED ✓'}
            {isError && 'LEDGER ERROR'}
          </h3>
        </div>

        {/* Message */}
        <p className="font-sans text-sm font-light text-foreground/90 mb-4 leading-relaxed">
          {modal.message}
        </p>

        {/* Details */}
        {modal.details && Object.keys(modal.details).length > 0 && (
          <div className="mt-4 p-3 bg-muted/30 rounded-[2px] border border-secondary/30">
            <dl className="space-y-1 font-sans text-sm">
              {Object.entries(modal.details).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <dt className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</dt>
                  <dd className="font-mono font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Dismissible indicator */}
        {!isLoading && (
          <div className="mt-4 text-center">
            <button
              onClick={closeModal}
              className="text-xs font-mono uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              [TAP TO DISMISS]
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

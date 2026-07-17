import { useCallback, useRef, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';

/**
 * Hook trả về { confirm, ConfirmUI }.
 * Dùng: const { confirm, ConfirmUI } = useConfirm();
 * const ok = await confirm({ title: '...', message: '...' });
 * if (ok) { ...xoá... }
 * Nhớ render <ConfirmUI /> ở cuối component.
 */
export function useConfirm() {
  const [state, setState] = useState({ open: false, title: '', message: '', danger: true });
  const resolver = useRef(null);

  const confirm = useCallback(({ title, message, danger = true }) => {
    setState({ open: true, title, message, danger });
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handle = (result) => {
    setState((s) => ({ ...s, open: false }));
    if (resolver.current) {
      resolver.current(result);
      resolver.current = null;
    }
  };

  const ConfirmUI = () => (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      danger={state.danger}
      onConfirm={() => handle(true)}
      onCancel={() => handle(false)}
    />
  );

  return { confirm, ConfirmUI };
}

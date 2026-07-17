import { useCallback, useRef, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function useConfirm() {
  const [state, setState] = useState({ open: false, title: '', message: '' });
  const resolver = useRef(null);

  const confirm = useCallback(({ title, message }) => {
    setState({ open: true, title, message });
    return new Promise((resolve) => { resolver.current = resolve; });
  }, []);

  const handle = (result) => {
    setState((s) => ({ ...s, open: false }));
    if (resolver.current) { resolver.current(result); resolver.current = null; }
  };

  const ConfirmUI = () => (
    <ConfirmDialog open={state.open} title={state.title} message={state.message}
      onConfirm={() => handle(true)} onCancel={() => handle(false)} />
  );

  return { confirm, ConfirmUI };
}

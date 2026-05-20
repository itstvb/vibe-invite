import { useEffect, useState } from 'react';

export function useEnvelopeAnimation(isPreview: boolean) {
  const [opened, setOpened] = useState(isPreview);
  const [showModal, setShowModal] = useState(isPreview);

  useEffect(() => {
    if (isPreview) {
      setOpened(true);
      setShowModal(true);
    }
  }, [isPreview]);

  function openEnvelope() {
    if (opened) return;
    setOpened(true);
    window.setTimeout(() => setShowModal(true), 900);
  }

  return {
    opened,
    showModal,
    openEnvelope
  };
}

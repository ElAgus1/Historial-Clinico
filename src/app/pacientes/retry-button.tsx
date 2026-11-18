'use client';

export default function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="btn-primary"
    >
      Reintentar
    </button>
  );
}

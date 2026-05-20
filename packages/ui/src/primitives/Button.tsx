import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ children, variant = 'primary', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      {...props}
      data-variant={variant}
      style={{
        border: 0,
        borderRadius: 999,
        cursor: 'pointer',
        fontWeight: 700,
        padding: '0.75rem 1rem'
      }}
    >
      {children}
    </button>
  );
}

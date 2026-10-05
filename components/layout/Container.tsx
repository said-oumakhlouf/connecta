import type { ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function Container({
  children,
  className = '',
}: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-310 px-4 sm:px-5.5 md:px-12 xl:max-w-335 2xl:max-w-375 2xl:px-16 ${className}`}
    >
      {children}
    </div>
  );
}

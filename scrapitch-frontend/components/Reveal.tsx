"use client";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export default function Reveal({ children, className }: RevealProps) {
  return <div className={className}>{children}</div>;
}

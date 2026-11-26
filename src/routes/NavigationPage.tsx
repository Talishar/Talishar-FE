import type { ReactNode } from 'react';
import styles from './NavigationPage.module.css';

interface NavigationPageProps {
  title: string;
  className: string;
  children: ReactNode;
}

export default function NavigationPage({
  title,
  className,
  children
}: NavigationPageProps) {
  return (
    <main className={`${className} ${styles.page}`}>
      <h1 className={styles.visuallyHidden}>{title}</h1>
      {children}
    </main>
  );
}

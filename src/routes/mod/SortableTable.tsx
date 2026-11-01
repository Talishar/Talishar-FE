import React, { useMemo, useState } from 'react';
import tableStyles from './ModTable.module.css';

type SortValue = number | string | null;

export interface SortColumn<T> {
  value: (row: T) => SortValue;
  ascendingFirst?: boolean;
}

interface SortState<K extends string> {
  key: K;
  descending: boolean;
}

const compareValues = (a: SortValue, b: SortValue) => {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, {
    sensitivity: 'base',
    numeric: true
  });
};

export const useTableSort = <T, K extends string>(
  rows: T[],
  columns: Record<K, SortColumn<T>>
) => {
  const [sort, setSort] = useState<SortState<K> | null>(null);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const value = columns[sort.key].value;
    const direction = sort.descending ? -1 : 1;
    return [...rows].sort((rowA, rowB) => {
      const a = value(rowA);
      const b = value(rowB);
      if (a === null || b === null)
        return (a === null ? 1 : 0) - (b === null ? 1 : 0);
      return compareValues(a, b) * direction;
    });
  }, [rows, columns, sort]);

  const toggleSort = (key: K) =>
    setSort((current) =>
      current?.key === key
        ? { key, descending: !current.descending }
        : { key, descending: !columns[key].ascendingFirst }
    );

  return { sortedRows, sort, toggleSort };
};

interface SortHeaderProps<K extends string> {
  id: K;
  sort: SortState<K> | null;
  onSort: (key: K) => void;
  numeric?: boolean;
  children: React.ReactNode;
}

export const SortHeader = <K extends string>({
  id,
  sort,
  onSort,
  numeric,
  children
}: SortHeaderProps<K>) => {
  const active = sort?.key === id;
  return (
    <th
      scope="col"
      className={numeric ? tableStyles.numeric : undefined}
      aria-sort={
        active ? (sort?.descending ? 'descending' : 'ascending') : 'none'
      }
    >
      <button
        type="button"
        className={tableStyles.sortButton}
        onClick={() => onSort(id)}
      >
        {children}
        <span className={tableStyles.sortIndicator} aria-hidden="true">
          {active ? (sort?.descending ? '▼' : '▲') : ''}
        </span>
      </button>
    </th>
  );
};

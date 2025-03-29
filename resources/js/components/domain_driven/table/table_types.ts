import React from 'react';

export interface Idable {
  id: number;
}

export interface TableColumn<T> {
  filterable: boolean;
  sortable: boolean;
  selectable: boolean;
  label: string;
  description: string;
  getValue: (item: T) => string | number | boolean | React.ReactElement;
  width?: number;
}

export interface RowAction<T> {
  label?: string;
  callback: (item: T) => void;
  getActionElement: (item: T) => React.ReactNode;
  Icon: React.ReactNode;
  canAct?: (item: T) => boolean;
  tooltip?: string;
}

export interface TableProps<T extends Idable> {
  title: string;
  data: T[];
  rowActions?: RowAction<T>[];
  columns: TableColumn<T>[];
  actionColumnWidth?: number;
  onRowClick?: (itemIndex: number, item: T) => void;
  globalActions?: React.ReactNode | React.ReactNode[];
}

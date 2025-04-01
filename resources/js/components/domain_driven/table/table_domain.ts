import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import { Idable } from './table_types';
export interface ColumnDef<T extends Idable> {
  id: string;
  accessorKey: keyof T;
  header: string;
  cell: (row: T, index: number) => React.ReactNode;
  size?: number;
  sortable?: boolean;
}
export class TableDomain<T extends Idable> implements TableDomainPort<T> {
  columns: ObservableValue<ColumnDef<T>[]>;
  filter: ObservableValue<string> = new ObservableValue('');
  sortConfig: ObservableValue<{ key: keyof T; direction: 'asc' | 'desc' | null } | null>;
  selectedRowId: ObservableValue<number | null>;
  filteredData: ObservableValue<T[]>;
  dataRunner: AsyncActionRunner<T[]>;
  constructor(columns: ColumnDef<T>[], dataRunner: AsyncActionRunner<T[]>) {
    this.dataRunner = dataRunner;
    this.columns = new ObservableValue(columns);
    this.sortConfig = new ObservableValue<{ key: keyof T; direction: 'asc' | 'desc' | null } | null>(null);
    this.selectedRowId = new ObservableValue<number | null>(null);
    this.filteredData = new ObservableValue<T[]>(dataRunner.getValue() || []);
    this.filter.onChange((filter) => {
      const data = dataRunner.getValue();
      if (data) {
        const filteredData = data.filter((item) => Object.values(item).some((value) => String(value).toLowerCase().includes(filter.toLowerCase())));
        this.filteredData.setValue(filteredData);
      }
    });
  }

  setColumns(columns: ColumnDef<T>[]) {
    console.log('Setting columns:', columns);
    this.columns.setValue(columns);
  }

  setFilter(filter: string) {
    this.filter.setValue(filter);
  }

  setSortConfig(sortConfig: { key: keyof T; direction: 'asc' | 'desc' | null } | null) {
    this.sortConfig.setValue(sortConfig);
  }
  toggleSort(key: keyof T) {
    console.log('Toggling sort for key:', key);
    const currentSort = this.sortConfig.getValue();
    console.log('Current sort:', currentSort);
    this.sortConfig.setValue({
      key,
      direction: currentSort?.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    });
  }

  setSelectedRowId(id: number | null) {
    this.selectedRowId.setValue(id);
  }
}

export interface TableDomainPort<T extends Idable> {
  columns: ObservableValue<ColumnDef<T>[]>;
  filter: ObservableValue<string>;
  sortConfig: ObservableValue<{ key: keyof T; direction: 'asc' | 'desc' | null } | null>;
  selectedRowId: ObservableValue<number | null>;
  filteredData: ObservableValue<T[]>;
  dataRunner: AsyncActionRunner<T[]>;
  setColumns(columns: ColumnDef<T>[]): void;
  setFilter(filter: string): void;
  setSortConfig(sortConfig: { key: keyof T; direction: 'asc' | 'desc' | null } | null): void;
  toggleSort(key: keyof T): void;
  setSelectedRowId(id: number | null): void;
}

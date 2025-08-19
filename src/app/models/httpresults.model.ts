
  export interface SaveRecordResult<T> {
    record: T;
    success: boolean;
    message?: string;
    status?: string;
  }

  export interface DeleteResult {
    success: boolean;
    message?: string;
    info?: string;
    status?: string;
  }

  export interface TableResult<T> {
    records: T[];
    totalRecords: number;
    status: string;
    message: string | null;
    success: boolean;
}
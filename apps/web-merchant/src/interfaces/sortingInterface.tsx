export enum sortDirection {
  ASC = "asc",
  DESC = "desc",
}

export interface Sorting {
  sortBy: string;
  sortDirection: sortDirection;
}

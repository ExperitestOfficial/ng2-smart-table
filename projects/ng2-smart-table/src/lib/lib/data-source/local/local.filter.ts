export function filterValues<K>(value: K, search: string): boolean {
  return value.toString().toLowerCase().includes(search.toString().toLowerCase());
}

export class LocalFilter {

  static filter<T>(data: T[], field: keyof T, search: string, customFilter?: (value: T[keyof T], search: string) => boolean): T[] {
    const filter: (i: T[keyof T], search: string) => boolean = customFilter ? customFilter : filterValues;

    return data.filter((el) => {
      const value = typeof el[field] === 'undefined' || el[field] === null ? '' : el[field];
      return filter.call(null, value, search);
    });
  }
}

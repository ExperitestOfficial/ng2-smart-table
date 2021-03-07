export function compareValues(direction: any, a: any, b: any) {
  if (!a || !b) {
    return (!b && !a ? 0 : (b ? -1 : 1)) * direction;
  }
  return a.toString().localeCompare(b.toString(), 'en', {numeric: true, ignorePunctuation: true}) * direction;
}

export class LocalSorter {

  static sort<T>(data: T[], field: keyof T, direction: string,
                 customCompare?: (direction: 1 | -1, value1: any, value2: any) => number): T[] {

    const dir: number = (direction === 'asc') ? 1 : -1;
    const compare: (direction: 1 | -1, value1: any, value2: any) => number = customCompare ? customCompare : compareValues;

    return data.sort((a, b) => {
      return compare.call(null, dir, a[field], b[field]);
    });
  }
}

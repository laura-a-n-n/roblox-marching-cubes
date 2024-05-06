/* eslint-disable @typescript-eslint/no-explicit-any */
export const range = (size: number, start = 0) => new Array<number>(size, 0).map((_, index) => start + index);

export const concat = <T extends defined>(...arrays: T[][]): T[] => {
	const result: T[] = [];
	for (const arr of arrays) {
		for (const element of arr) {
			result.push(element);
		}
	}
	return result;
};

export function slice<T extends defined[]>(tbl: T, start?: number, stop?: number): T {
	if (start === undefined) {
		return table.clone(tbl) as T;
	}

	const startIndex = start;
	const stopIndex = stop ?? tbl.size() - 1;

	const newTbl = table.create(stopIndex - startIndex + 1) as T;
	tbl.move(startIndex, stopIndex, 0, newTbl);

	return newTbl;
}

export function cartesianProduct(...arrays: any[][]): any[][] {
	// Base case: if no arrays provided, return empty array
	if (arrays.size() === 0) {
		return [[]];
	}

	// Recursive case: compute Cartesian product of arrays recursively
	const head = arrays[0];
	const tail = slice(arrays, 1);
	const partialProduct = cartesianProduct(...tail);

	// Compute Cartesian product
	const result: any[][] = [];
	for (const item of head) {
		for (const partial of partialProduct) {
			result.push([item, ...partial]);
		}
	}

	return result;
}

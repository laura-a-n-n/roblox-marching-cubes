import { cartesianProduct, range } from "./utils";

export const getUVCoords = (width: number, height: number) => {
	const horizontalAxis = range(width);
	const verticalAxis = range(height);
	return cartesianProduct(horizontalAxis, verticalAxis);
};

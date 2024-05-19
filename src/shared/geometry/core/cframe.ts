/**
 * Various hacks with CFrames.
 * @module
 */

/**
 * Treating a CFrame as a 3x3 matrix, returns the inverse matrix.
 * Unlike CFrame:Inverse(), this does not assume that the CFrame
 * represents an orthogonal matrix, i.e. its determinant need not be one.
 */
export const invertMatrix3D = (matrix: CFrame): CFrame => {
	const [x, y, z, a, b, c, d, e, f, g, h, i] = matrix.GetComponents();
	const adjugate = new CFrame(
		x,
		y,
		z,
		e * i - f * h,
		c * h - b * i,
		b * f - c * e,
		f * g - d * i,
		a * i - c * g,
		c * d - a * f,
		d * h - e * g,
		b * g - a * h,
		a * e - b * d,
	);
	const det = matrix.Inverse().XVector.Dot(adjugate.XVector);
	return CFrame.fromMatrix(
		new Vector3(),
		adjugate.XVector.div(det),
		adjugate.YVector.div(det),
		adjugate.ZVector.div(det),
	);
};

export const getCircumcenter3D = (point0: Vector3, point1: Vector3, point2: Vector3, point3: Vector3): Vector3 => {
	const matrix = CFrame.fromMatrix(
		new Vector3(), // fourth column
		point1.sub(point0), // first column
		point2.sub(point0), // second column
		point3.sub(point0), // third column
	);
	const inverse = invertMatrix3D(matrix.Inverse()); // get the inverse of the transpose of the matrix

	const dotProducts = new Vector3(point1.Dot(point1), point2.Dot(point2), point3.Dot(point3));
	const vector = dotProducts.sub(Vector3.one.mul(point0.Dot(point0))).div(2);

	return inverse.mul(vector);
};

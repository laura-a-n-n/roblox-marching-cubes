/**
 * A type designated for 3D signed distance functions.
 * @param vector the point whose signed distance should be evaluated
 * @param params optional params that control the SDF output
 * @returns signed distance of the point from the boundary of a surface
 * @see SignedDistanceFunction
 */
export type SDFDefinition = (vector: Vector3, ...params: number[]) => number;

/**
 * A signed distance function tells how far away
 * a point is from the boundary of some surface.
 * What makes it *signed* is that it doesn't always
 * return a positive number, it returns a negative number
 * whenever the point is inside of the surface.
 * @see https://en.wikipedia.org/wiki/Signed_distance_function
 * @module
 */
export class SignedDistanceFunction {
	/**
	 * The particular signed distance function to use.
	 * For examples, see sdf-lib.ts.
	 */
	public forward: SDFDefinition;
	private marchableGrid: { binary: 0 | 1; float: number }[] = [];
	private vertexGrid: Vector3[] = [];
	private lastTolerance = 0.03;

	public constructor(definition: SDFDefinition, meshPart?: MeshPart) {
		this.forward = definition;
	}

	public raytrace(rayOrigin: Vector3, rayDirection: Vector3, steps = 10, tolerance = 0.01) {
		let point = new Vector3(rayOrigin.X, rayOrigin.Y, rayOrigin.Z);
		let distance = this.forward(point);
		for (let i = 0; i < steps; i++) {
			if (math.abs(distance) < tolerance) {
				return { point, distance, converged: true };
			}
			point = point.add(rayDirection.mul(distance));
			distance = this.forward(point);
		}
		return { point, distance, converged: false };
	}

	public sampleRays() {
		throw error("sampleRays is not yet implemented");
	}

	public getMarchableGrid() {
		return this.marchableGrid;
	}

	public getVertexGrid() {
		return this.vertexGrid;
	}

	public getSamplePoint(
		latticePoint: Vector3,
		resolution: Vector3,
		leftBottomBack?: Vector3,
		rightTopFront?: Vector3,
	) {
		leftBottomBack ??= Vector3.one.mul(-1);
		rightTopFront ??= Vector3.one;

		return leftBottomBack.add(latticePoint.div(resolution.sub(Vector3.one)).mul(rightTopFront.sub(leftBottomBack)));
	}

	getLastTolerance() {
		return this.lastTolerance;
	}

	public sampleGrid(
		resolution: Vector3,
		tolerance = 0.03,
		isosurface = true,
		leftBottomBack?: Vector3,
		rightTopFront?: Vector3,
	) {
		leftBottomBack ??= Vector3.one.mul(-1);
		rightTopFront ??= Vector3.one;

		const gridSamples: Vector3[] = [];
		this.marchableGrid = [];
		this.vertexGrid = [];
		this.lastTolerance = tolerance;

		for (let x = 0; x < resolution.X; x++) {
			for (let y = 0; y < resolution.Y; y++) {
				for (let z = 0; z < resolution.Z; z++) {
					// could use Vector3.lerp but it'd use more lines
					const samplePoint = this.getSamplePoint(new Vector3(x, y, z), resolution);
					const distance = this.forward(samplePoint);
					const converged = (isosurface ? math.abs(distance) : distance) <= tolerance;
					if (converged) {
						gridSamples.push(samplePoint);
					}
					this.vertexGrid.push(samplePoint);
					this.marchableGrid.push({ binary: converged ? 1 : 0, float: distance });
				}
			}
		}

		return gridSamples;
	}
}
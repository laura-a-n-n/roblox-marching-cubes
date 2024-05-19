import MarchedMesh, { MarchableGrid } from "shared/geometry/core/marching-cubes/marched-mesh";

/**
 * A type designated for 3D signed distance functions.
 * @param vector the point whose signed distance should be evaluated
 * @param params optional params that control the SDF output
 * @returns signed distance from the point to the boundary of a surface
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
	 * For examples, see sdf-library.ts.
	 * @see SDFLibrary
	 */
	public forward: SDFDefinition;

	/**
	 * The last marchable grid computed is stored here.
	 * @see sampleGrid
	 */
	private marchableGrid?: MarchableGrid;

	/**
	 * The last surface level (or "tolerance") that was used to determine occupancy.
	 * Points with a signed distance less than this value are deemed inside the surface.
	 * Signed distances with absolute value less than this number are considered on the boundary.
	 */
	private surfaceLevel = 0.03;

	/**
	 * The last resolution used to sample a regular grid.
	 * @see sampleGrid
	 */
	private gridResolution = 64;

	public constructor(definition: SDFDefinition) {
		this.forward = definition;
	}

	/**
	 * Given some resolution, sample a cube of grid points
	 * and return MarchablePointData for each point.
	 * @param resolution how many points to sample along each axis
	 * @param tolerance the surface level to use (see the surfaceLevel property)
	 * @param isosurface whether or not to just return points on the boundary, or all points inside
	 * @param leftBottomBack the left, bottom, back corner of the cube
	 * @param rightTopFront the right, top, front corner of the cube
	 * @returns object of both an array of converged points, as well as
	 * this.marchableGrid with MarchablePointData for each point in the grid
	 * @see MarchablePointData
	 */
	public sampleGrid(
		resolution?: number,
		tolerance = 0.03,
		isosurface = true,
		leftBottomBack?: Vector3,
		rightTopFront?: Vector3,
	) {
		resolution ??= this.gridResolution;
		leftBottomBack ??= Vector3.one.mul(-1);
		rightTopFront ??= Vector3.one;

		const convergedPoints: Vector3[] = [];
		const marchableGrid: MarchableGrid = MarchedMesh.getEmptyMarchableGrid(tolerance);
		this.surfaceLevel = tolerance;

		for (let x = 0; x < resolution; x++) {
			for (let y = 0; y < resolution; y++) {
				for (let z = 0; z < resolution; z++) {
					// could use Vector3.lerp but it'd use more lines
					const samplePoint = this.getSamplePoint(new Vector3(x, y, z), resolution);
					const distance = this.forward(samplePoint);
					const converged = (isosurface ? math.abs(distance) : distance) <= tolerance;
					if (converged) {
						convergedPoints.push(samplePoint);
					}
					marchableGrid.push({ occupancy: converged ? 1 : 0, value: distance, samplePoint });
				}
			}
		}

		this.marchableGrid = marchableGrid;
		this.gridResolution = resolution;

		return { convergedPoints, marchableGrid };
	}

	/**
	 * Given an integer lattice point whose coordinates
	 * are in the interval `[0, resolution)`, return
	 * a point in a cube with the given resolution and corners.
	 * @param latticePoint the indices of a triple loop over the cube's points
	 * @see sampleGrid
	 */
	public getSamplePoint(
		latticePoint: Vector3,
		resolution: number,
		leftBottomBack?: Vector3,
		rightTopFront?: Vector3,
	) {
		leftBottomBack ??= Vector3.one.mul(-1);
		rightTopFront ??= Vector3.one;

		return leftBottomBack.add(
			latticePoint.div(Vector3.one.mul(resolution - 1)).mul(rightTopFront.sub(leftBottomBack)),
		);
	}

	/**
	 * Returns the last marchable grid, or a new one if not defined.
	 * @param
	 */
	public getLastMarchableGrid() {
		if (this.marchableGrid?.size() === 0) {
			this.sampleGrid();
		}
		return this.marchableGrid;
	}

	public toMarchableGrid(resolution?: number) {
		this.sampleGrid(resolution);
		return this.marchableGrid as MarchableGrid;
	}

	/**
	 * @returns the last surface level used to determine
	 * occupancy with sampleGrid
	 * @see surfaceLevel
	 * @see sampleGrid
	 */
	public getLastSurfaceLevel() {
		return this.surfaceLevel;
	}

	/**
	 * @returns the last grid sampling resolution
	 * @see gridResolution
	 * @see sampleGrid
	 */
	public getLastGridResolution() {
		return this.gridResolution;
	}

	public sampleRays() {
		error("sampleRays is not yet implemented");
	}

	/**
	 * Does ray marching on the SDF. Although it should be functional
	 * this is currently unused, so minimal documentation for now.
	 * @param rayOrigin
	 * @param rayDirection
	 * @param steps
	 * @param tolerance
	 * @returns
	 */
	public spheretrace(rayOrigin: Vector3, rayDirection: Vector3, steps = 10, tolerance = 0.01) {
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
}

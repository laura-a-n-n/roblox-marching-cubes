import { EDGE_VERTEX_INDICES, TRIANGLE_TABLE } from "shared/geometry/core/marching-cubes/lookup-tables";
import { inverseLerp } from "shared/geometry/core/utils";
import { SignedDistanceFunction } from "shared/geometry/core/sdf";
import Object from "@rbxts/object-utils";

export type Triangle = [Vector3, Vector3, Vector3];
export type TriangleIndices = [number, number, number];
export type Cube = [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1];
export type CubeIndices = [number, number, number, number, number, number, number, number];

/**
 * The data of a point in a marchable grid.
 * @remarks
 * - `occupancy` should be 0 if outside the boundary of the surface, 1 if inside
 * - `value` is a scalar used for interpolation, e.g. the signed distance of the point to the surface
 * - `sampledPoint` is the 3D coordinates of the point in question
 */
export type MarchablePointData = { occupancy: 0 | 1; value: number; samplePoint: Vector3 };

/**
 * Data of a regular grid, ready for polygonization with marching cubes.
 */
export type MarchableGrid = Array<MarchablePointData> & { surfaceLevel: number };

export default class MarchedMesh {
	private marchableGrid: MarchableGrid | undefined;
	public meshPart: MeshPart;
	public editableMesh: EditableMesh;
	public scale = 32;

	public constructor(
		marchableGrid: MarchableGrid,
		meshPart?: MeshPart,
		public meshPartParent?: Instance,
	) {
		if (!meshPart) {
			meshPart = new Instance("MeshPart");
			meshPart.Position = new Vector3(0, 10, 0);
			meshPart.Size = Vector3.one;
		}
		this.marchableGrid = marchableGrid;
		this.meshPart = meshPart;
		this.editableMesh = this.resetEditableMesh();
	}

	public static getEmptyMarchableGrid(tolerance: number) {
		return Object.assign(new Array<MarchablePointData>(), {
			surfaceLevel: tolerance,
		});
	}

	public getGridResolution() {
		const grid = this.getGridOrThrow();
		return math.round(math.pow(grid.size(), 1 / 3));
	}

	public getCurrentMarchableGrid() {
		return this.marchableGrid;
	}

	public setMarchableGrid(grid: MarchableGrid) {
		this.marchableGrid = grid;
	}

	public render(grid?: MarchableGrid) {
		this.marchableGrid ??= grid ?? this.getGridOrThrow();
		if (this.editableMesh.GetTriangles().size() === 0) {
			this.march();
		}
		this.meshPart.Parent = this.meshPartParent ?? game.Workspace;
	}

	public resetEditableMesh() {
		if (this.editableMesh) {
			this.editableMesh.Destroy();
		}
		const editableMesh = new Instance("EditableMesh");
		editableMesh.Parent = this.meshPart;
		this.editableMesh = editableMesh;
		return editableMesh;
	}

	public getCubeHash(...args: Cube) {
		if (args.size() !== 8) {
			error(`getCubeHash requires eight vertices, but you provided ${args.size()}`);
		}
		let key = 0;
		for (let i = 7; i >= 0; i--) {
			key *= 2;
			key += args[i];
		}
		return key;
	}

	public getCubeIndicesFromCornerIndex(i: number): CubeIndices | [] {
		const resolution = this.getGridResolution();
		const z = 1;
		const y = resolution;
		const x = resolution * resolution;

		if (i + z + x + y >= resolution * resolution * resolution) {
			// cube does not exist
			return [];
		}

		return [
			/* front face */
			i,
			i + x,
			i + y,
			i + x + y,
			/* back face */
			i + z,
			i + z + x,
			i + z + y,
			i + z + x + y,
		];
	}

	public getCubeFromIndices(indices: CubeIndices): Cube {
		return indices.map((i) => {
			return this.getGridOrThrow()[i].occupancy;
		}) as Cube;
	}

	public latticePointFromLocalCubeIndex(i: number) {
		if (i < 0 || i > 7) {
			error("i must be a local cube index.");
		}
		return new Vector3(
			bit32.arshift(bit32.band(i, 1), 0),
			bit32.arshift(bit32.band(i, 2), 1),
			bit32.arshift(bit32.band(i, 4), 2),
		);
	}

	public gridIndexFromLatticePoint(v: Vector3) {
		const resolution = this.getGridResolution();
		let result = v.X * resolution;
		result += v.Y;
		result *= resolution;
		result += v.Z;
		return result;
	}

	public gridIndexFromLocalCubeIndex(i: number) {
		return this.gridIndexFromLatticePoint(this.latticePointFromLocalCubeIndex(i));
	}

	public vertexIndexToWorldPosition(i: number) {
		return this.getGridOrThrow()[i].samplePoint;
	}

	public vertexIndexToLatticePoint(i: number) {
		const resolution = this.getGridResolution();
		const z = i % resolution;
		const temp = (i - z) / resolution;
		const y = temp % resolution;
		const x = (temp - y) / resolution;
		return new Vector3(x, y, z);
	}

	march() {
		const resolution = this.getGridResolution();
		const marchableGrid = this.marchableGrid as MarchableGrid;

		if (resolution === 0) {
			warn("Cannot march a point cloud without any points. That's just a cloud");
			return;
		}
		this.resetEditableMesh();

		const maxGridIndex = math.pow(resolution, 3) - math.pow(resolution, 2) - resolution - 1;
		for (let gridIndex = 0; gridIndex < maxGridIndex; gridIndex++) {
			const cubeIndices = this.getCubeIndicesFromCornerIndex(gridIndex);
			const cube = this.getCubeFromIndices(cubeIndices as CubeIndices);
			const hash = this.getCubeHash(...cube);
			const lookup = TRIANGLE_TABLE[hash];

			const map: Map<number, Map<number, number>> = new Map();

			for (let triangle = 0; triangle < math.floor((lookup.size() - 1) / 3); triangle++) {
				const index = 3 * triangle;
				const vertexIds: TriangleIndices = [0, 1, 2];

				[index, index + 1, index + 2].forEach((edgeIndex, mapIndex) => {
					const [vertex0, vertex1] = EDGE_VERTEX_INDICES[lookup[edgeIndex]];
					const index0 = gridIndex + this.gridIndexFromLocalCubeIndex(vertex0);
					const index1 = gridIndex + this.gridIndexFromLocalCubeIndex(vertex1);
					const interpolation = inverseLerp(
						marchableGrid.surfaceLevel ?? 0,
						marchableGrid[index0].value,
						marchableGrid[index1].value,
					);
					const vertex = this.vertexIndexToWorldPosition(index0).Lerp(
						this.vertexIndexToWorldPosition(index1),
						math.clamp(interpolation, 0, 1),
					);

					const adjacencyList = map.get(index0);
					const vertexIndex = adjacencyList?.get(index1);

					if (!adjacencyList || vertexIndex === undefined) {
						// Vertex does not already exist, create it
						const vertexId = this.editableMesh.AddVertex(vertex.mul(this.scale));
						vertexIds[mapIndex] = vertexId;
						map.set(index0, new Map());
						map.get(index0)?.set(index1, vertexId);
						map.set(index1, new Map());
						map.get(index1)?.set(index0, vertexId);
					} else {
						vertexIds[mapIndex] = map.get(index0)!.get(index1)!;
					}
				});
				this.editableMesh.AddTriangle(...vertexIds);
			}
		}
	}

	public getScale() {
		return this.scale;
	}

	public setScale(scale: number) {
		this.scale = scale;
	}

	private getGridOrThrow() {
		if (!this.marchableGrid) {
			error("A marchable grid was not provided!");
		}
		return this.marchableGrid;
	}
}

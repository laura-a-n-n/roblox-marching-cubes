import { EDGE_VERTEX_INDICES, TRIANGLE_TABLE } from "shared/marching-cubes/lookup-tables";
import { inverseLerp } from "shared/core/utils";
import { SignedDistanceFunction } from "shared/core/sdf";

export type Triangle = [Vector3, Vector3, Vector3];
export type TriangleIndices = [number, number, number];
export type Cube = [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1];
export type CubeIndices = [number, number, number, number, number, number, number, number];

export default class MarchedMesh {
	public meshPart: MeshPart;
	public editableMesh: EditableMesh;
	public scale = 32;

	public constructor(
		public sdf: SignedDistanceFunction,
		meshPart?: MeshPart,
		public meshPartParent?: Instance,
	) {
		if (!meshPart) {
			meshPart = new Instance("MeshPart");
			meshPart.Position = new Vector3(0, 10, 0);
			meshPart.Size = Vector3.one;
		}
		this.meshPart = meshPart;
		this.editableMesh = this.resetEditableMesh();
	}

	public render() {
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
			throw error(`getCubeHash requires eight vertices, but you provided ${args.size()}`);
		}
		let key = 0;
		for (let i = 7; i >= 0; i--) {
			key *= 2;
			key += args[i];
		}
		return key;
	}

	public getCubeIndicesFromCornerIndex(i: number): CubeIndices | [] {
		const resolution = this.sdf.getLastGridResolution();
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
		const grid = this.sdf.getMarchableGrid();
		return indices.map((i) => grid[i].occupancy) as Cube;
	}

	public latticePointFromLocalCubeIndex(i: number) {
		if (i < 0 || i > 7) {
			throw error("i must be a local cube index.");
		}
		return new Vector3(
			bit32.arshift(bit32.band(i, 1), 0),
			bit32.arshift(bit32.band(i, 2), 1),
			bit32.arshift(bit32.band(i, 4), 2),
		);
	}

	public gridIndexFromLatticePoint(v: Vector3) {
		const resolution = this.sdf.getLastGridResolution();
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
		return this.sdf.getMarchableGrid()[i].samplePoint;
	}

	public vertexIndexToLatticePoint(i: number) {
		const resolution = this.sdf.getLastGridResolution();
		const z = i % resolution;
		const temp = (i - z) / resolution;
		const y = temp % resolution;
		const x = (temp - y) / resolution;
		return new Vector3(x, y, z);
	}

	march() {
		const marchableGrid = this.sdf.getMarchableGrid();
		const resolution = this.sdf.getLastGridResolution();

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
						this.sdf.getLastSurfaceLevel(),
						marchableGrid[index0].signedDistance,
						marchableGrid[index1].signedDistance,
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
					// vertices[mapIndex] = vertex;
				});
				// this.triangles.push(vertices);
				// this.vertices.push(vertices[0], vertices[1], vertices[2]);
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
}

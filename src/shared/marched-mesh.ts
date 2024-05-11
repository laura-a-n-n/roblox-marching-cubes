import { EDGE_VERTEX_INDICES, TRIANGLE_TABLE } from "shared/marching-cubes";
import { PointCloud } from "shared/point-cloud";

export type Triangle = [Vector3, Vector3, Vector3];
export type TriangleIndices = [number, number, number];
export type Cube = [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1];
export type CubeIndices = [number, number, number, number, number, number, number, number];

export default class MarchedMesh {
	public meshPart: MeshPart;
	public triangles: Triangle[] = [];
	public vertices: Vector3[] = [];
	private editableMesh: EditableMesh;

	constructor(
		public pointCloud: PointCloud,
		meshPart?: MeshPart,
	) {
		if (!meshPart) {
			meshPart = new Instance("MeshPart");
			meshPart.Position = new Vector3(0, 10, 0);
			meshPart.Size = Vector3.one;
		}
		this.meshPart = meshPart;
		this.editableMesh = this.resetEditableMesh();
	}

	resetEditableMesh() {
		if (this.editableMesh) {
			this.editableMesh.Destroy();
		}
		const editableMesh = new Instance("EditableMesh");
		editableMesh.Parent = this.meshPart;
		this.editableMesh = editableMesh;
		return editableMesh;
	}

	getCubeHash(...args: Cube) {
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

	getCubeIndicesFromCornerIndex(i: number): CubeIndices | [] {
		const resolution = this.pointCloud.getResolution();
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

	getCubeFromIndices(indices: CubeIndices): Cube {
		return indices.map((i) => this.pointCloud.marchableGrid[i]) as Cube;
	}

	getVector3FromLocalCubeIndex(i: number) {
		if (i < 0 || i > 7) {
			throw error("i must be a local cube index.");
		}
		return new Vector3(
			bit32.arshift(bit32.band(i, 1), 0),
			bit32.arshift(bit32.band(i, 2), 1),
			bit32.arshift(bit32.band(i, 4), 2),
		);
	}

	getGlobalCubeIndexFromVector3(v: Vector3) {
		const resolution = this.pointCloud.getResolution();
		let result = v.X * resolution;
		result += v.Y;
		result *= resolution;
		result += v.Z;
		return result;
	}

	vertexIndexToPointCloudSpace(i: number) {
		// const sdf = this.pointCloud.sdf;
		// const resolution = this.pointCloud.getResolution();
		// const latticePoint = this.vertexIndexToCubeSpace(i);
		// const samplePoint = sdf.getSamplePoint(latticePoint, Vector3.one.mul(resolution));
		// print(this.pointCloud.sdf.getVertexGrid().size(), i);
		return this.pointCloud.sdf.getVertexGrid()[i];
	}

	private _vertexIndexToCubeSpace(i: number) {
		const resolution = this.pointCloud.getResolution();
		const z = i % resolution;
		const temp = (i - z) / resolution;
		const y = temp % resolution;
		const x = (temp - y) / resolution;
		return new Vector3(x, y, z);
	}

	march() {
		if (this.pointCloud.points.size() === 0) {
			warn("Cannot march a point cloud without any points. That's just a cloud");
			return;
		}
		const resolution = this.pointCloud.getResolution();
		const maxIndex = math.pow(resolution, 3) - math.pow(resolution, 2) - resolution - 1;
		this.resetEditableMesh();
		for (let i = 0; i < maxIndex; i++) {
			const cubeIndices = this.getCubeIndicesFromCornerIndex(i);
			const cube = this.getCubeFromIndices(cubeIndices as CubeIndices);
			const hash = this.getCubeHash(...cube);
			const lookup = TRIANGLE_TABLE[hash];

			const map: Map<number, Map<number, boolean>> = new Map();

			for (let triangle = 0; triangle < math.floor((lookup.size() - 1) / 3); triangle++) {
				const index = 3 * triangle;
				const vertexIds: TriangleIndices = [0, 1, 2];
				const vertices: Triangle = [Vector3.zero, Vector3.zero, Vector3.zero];
				[index, index + 1, index + 2].forEach((edgeIndex, mapIndex) => {
					const [v0, v1] = EDGE_VERTEX_INDICES[lookup[edgeIndex]];

					const vertex = this.vertexIndexToPointCloudSpace(
						i + this.getGlobalCubeIndexFromVector3(this.getVector3FromLocalCubeIndex(v0)),
					).Lerp(
						this.vertexIndexToPointCloudSpace(
							i + this.getGlobalCubeIndexFromVector3(this.getVector3FromLocalCubeIndex(v1)),
						),
						0.5,
					);
					vertexIds[mapIndex] = this.editableMesh.AddVertex(vertex.mul(this.pointCloud.getScale()));
					vertices[mapIndex] = vertex;
				});
				this.triangles.push(vertices);
				this.vertices.push(vertices[0], vertices[1], vertices[2]);
				this.editableMesh.AddTriangle(...vertexIds);
			}
		}
	}

	render() {
		if (this.triangles.size() === 0) {
			this.march();
			print(this.triangles);
			// const pointCloud = new PointCloud(this.pointCloud.sdf);
			// pointCloud.setAtomColor(new BrickColor("Hot pink"));
			// pointCloud.setAtomTransparency(0.9);
			// pointCloud.setPoints(this.pointCloud.sdf.getVertexGrid());
			// pointCloud.setScale(16);
			// pointCloud.drawAtoms();
			// pointCloud.render();
			// this.pointCloud.setPoints(this.vertices);
			// this.pointCloud.setScale(16);
			// this.pointCloud.drawAtoms();
			// this.pointCloud.render();
		}
		this.meshPart.Parent = game.Workspace;
	}
}
//

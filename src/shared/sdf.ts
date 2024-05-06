export type NumericalFunction = (...args: number[]) => number;

export class SignedDistanceFunction {
	private meshPart: MeshPart;
	private editableMesh: EditableMesh;
	private forward: NumericalFunction;

	constructor(definition: NumericalFunction, meshPart?: MeshPart) {
		this.forward = definition;

		if (!meshPart) {
			meshPart = new Instance("MeshPart");
			meshPart.Position = new Vector3(0, 10, 0);
		}
		this.meshPart = meshPart;

		const editableMesh = new Instance("EditableMesh");
		editableMesh.Parent = meshPart;
		this.editableMesh = editableMesh;
	}

	raytrace() {}

	render() {
		this.meshPart.Parent = game.Workspace;
	}
}

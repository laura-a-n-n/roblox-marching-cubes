import { SignedDistanceFunction } from "shared/sdf";

export class PointCloud {
	public model: Model;
	public points: Vector3[] = [];
	public marchableGrid: { binary: 0 | 1; float: number }[] = [];
	private resolution = 64;
	private scale = 32;
	private atomColor: BrickColor = new BrickColor("Really black");
	private atomTransparency = 0;

	constructor(
		public sdf: SignedDistanceFunction,
		model?: Model,
	) {
		if (!model) {
			model = new Instance("Model");
			model.Name = "PointCloud";
		}
		this.model = model;
	}

	private newAtom(position: Vector3, size = 0.25) {
		const atom = new Instance("Part");
		atom.Size = Vector3.one.mul(size);
		atom.Shape = Enum.PartType.Ball;
		atom.Anchored = true;
		atom.CanCollide = false;
		atom.Position = position;
		atom.TopSurface = Enum.SurfaceType.Smooth;
		atom.BottomSurface = Enum.SurfaceType.Smooth;
		atom.BrickColor = this.atomColor;
		atom.Transparency = this.atomTransparency;
		atom.Parent = this.model;
		return atom;
	}

	public drawAtoms() {
		this.model.ClearAllChildren();
		for (const point of this.points) {
			this.newAtom(point.mul(this.scale));
		}
	}

	public sampleGrid(resolution = this.resolution, scale = this.scale) {
		const points = this.sdf.sampleGrid(Vector3.one.mul(resolution));
		this.points = points;
		this.marchableGrid = this.sdf.getMarchableGrid();
		this.resolution = resolution;
		this.scale = scale;
		this.drawAtoms();
	}

	public setPoints(points: Vector3[]) {
		this.points = points;
	}

	public getResolution() {
		return this.resolution;
	}

	public getScale() {
		return this.scale;
	}

	public setScale(scale: number) {
		this.scale = scale;
	}

	public setAtomColor(color: BrickColor) {
		this.atomColor = color;
	}

	public setAtomTransparency(atomTransparency: number) {
		this.atomTransparency = atomTransparency;
	}

	public render() {
		if (this.points.size() === 0) {
			this.sampleGrid();
		}
		this.model.Parent = game.Workspace;
	}
}

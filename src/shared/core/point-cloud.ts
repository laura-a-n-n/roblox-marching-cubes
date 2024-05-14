import Object from "@rbxts/object-utils";
import { MarchableGrid, SignedDistanceFunction } from "shared/core/sdf";

/**
 * A set of points in 3D space.
 * The class has built-in tools for rendering point clouds
 * with parts, although this can be very expensive for large
 * clouds and may potentially cause game-crashing lag.
 */
export class PointCloud {
	public model: Model;
	public points: Vector3[] = [];
	public scale = 32;

	public atomProperties = {
		BrickColor: new BrickColor("Really black"),
		Transparency: 0.5,
		Shape: Enum.PartType.Ball,
		Anchored: true,
		CanCollide: false,
		Size: Vector3.one.mul(0.25),
		TopSurface: Enum.SurfaceType.Smooth,
		BottomSurface: Enum.SurfaceType.Smooth,
	} as const;

	public constructor(
		public sdf?: SignedDistanceFunction,
		model?: Model,
	) {
		if (!model) {
			model = new Instance("Model");
			model.Name = "PointCloud";
		}
		this.model = model;
	}

	public render() {
		if (this.points.size() === 0) {
			return;
		}
		if (this.model.GetChildren().size() === 0) {
			this.drawAtoms();
		}
		this.model.Parent = game.Workspace;
	}

	private newAtom(position: Vector3, options?: Partial<WritableInstanceProperties<Part>>) {
		const atom = new Instance("Part");
		Object.assign(this.atomProperties, options ?? {});
		Object.assign(atom, this.atomProperties);
		atom.Position = position;
		atom.Parent = this.model;
		return atom;
	}

	public drawAtoms(clear = true) {
		if (clear) {
			this.model.ClearAllChildren();
		}
		for (const point of this.points) {
			this.newAtom(point.mul(this.scale));
		}
	}

	public overrideAtomProperties(properties: Partial<WritableInstanceProperties<Part>>) {
		return Object.assign(this.atomProperties, properties);
	}

	public setPoints(points: Vector3[]) {
		this.points = points;
	}

	public getScale() {
		return this.scale;
	}

	public setScale(scale: number) {
		// could maybe re-render here, but it'd be expensive
		this.scale = scale;
	}
}

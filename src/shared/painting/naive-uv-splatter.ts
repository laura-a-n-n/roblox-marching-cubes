import { PointCloud } from "shared/core/point-cloud";
import { projectXY } from "shared/core/utils";

/**
 * Unwraps a mesh by just splatting the damn thing
 * in row-column fashion.
 */
export default class SimpleUVSplatter {
	public static splatMesh(mesh: EditableMesh) {
		const triangles = mesh.GetTriangles();

		print("We're gonna splat that damn mesh!");
		print("Triangle count", triangles.size());

		const triangleData = new Map<number, Map<number, Vector2>>();
		let totalWidth = 0;
		let totalHeight = 0;
		let maxHeight = 0;

		for (const triangleId of triangles) {
			const [v0, v1, v2] = mesh.GetTriangleVertices(triangleId);
			// First, let's make sure our triangle lies parallel to the Z plane
			const points = [mesh.GetPosition(v0), mesh.GetPosition(v1), mesh.GetPosition(v2)];
			let [p0, p1, p2] = points;
			if (p0.Z === p1.Z && p1.Z === p2.Z) {
				// by transitivity we are parallel to the Z plane, so there isn't anything to be done
			} else {
				// let's rotate the triangle so it lies flat.
				// first compute the angle of rotation
				const [q0, q1] = p0.Z !== p1.Z ? [p0, p1] : [p0, p2];
				const angle = new Vector2(q1.X, q1.Z).sub(new Vector2(q0.X, q0.Z)).Angle(Vector2.xAxis);
				const matrix = CFrame.Angles(0, angle, 0);
				[p0, p1, p2] = [matrix.mul(p0), matrix.mul(p1), matrix.mul(p2)];
			}

			// Perfect, now we can just ignore the Z axis
			// Let's compute a bounding box of the triangle
			const minX = math.min(p0.X, p1.X, p2.X);
			const minY = math.min(p0.Y, p1.Y, p2.Y);
			const maxX = math.max(p0.X, p1.X, p2.X);
			const maxY = math.max(p0.Y, p1.Y, p2.Y);
			const leftTop = new Vector2(minX, maxY);
			const width = maxX - minX;
			const height = maxY - minY;

			// Now localize each of the triangle's vertices to this box
			const translation = new Vector2(totalWidth, totalHeight);
			triangleData.set(
				triangleId,
				new Map([
					[v0, projectXY(p0).sub(leftTop).add(translation)],
					[v1, projectXY(p1).sub(leftTop).add(translation)],
					[v2, projectXY(p2).sub(leftTop).add(translation)],
				]),
			);

			totalWidth += width;
			totalHeight += height;
			maxHeight = math.max(height, maxHeight);
		}

		// Now we can set the UVs on this pass!
		for (const triangleId of triangles) {
			const [v0, v1, v2] = mesh.GetTriangleVertices(triangleId);
			const data = triangleData.get(triangleId)!;
			mesh.SetUV(v0, data.get(v0)!.div(new Vector2(totalWidth, totalHeight)));
			mesh.SetUV(v1, data.get(v1)!.div(new Vector2(totalWidth, totalHeight)));
			mesh.SetUV(v2, data.get(v2)!.div(new Vector2(totalWidth, totalHeight)));
		}
	}

	public static simpleRotationTest() {
		const cloud = new PointCloud();
		cloud.setPoints([new Vector3(1, 1, 1), new Vector3(4, 5, 6), new Vector3(2, 7, 4)]);

		let [p0, p1, p2] = cloud.points;
		const [q0, q1] = p0.Z !== p1.Z ? [p0, p1] : [p0, p2];
		const angle = new Vector2(q1.X, q1.Z).sub(new Vector2(q0.X, q0.Z)).Angle(Vector2.xAxis);
		const matrix = CFrame.Angles(0, angle, 0);
		[p0, p1, p2] = [matrix.mul(p0), matrix.mul(p1), matrix.mul(p2)];

		cloud.setAtomColor(BrickColor.Yellow());
		cloud.setScale(1);
		cloud.drawAtoms();
		cloud.render();

		task.wait(5);

		cloud.setPoints([p0, p1, p2]);
		cloud.setAtomColor(BrickColor.Yellow());
		cloud.setScale(1);
		cloud.drawAtoms();
		cloud.render();
	}
}

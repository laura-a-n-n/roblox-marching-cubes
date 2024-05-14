import { projectXY } from "shared/core/utils";

/**
 * This module does "UV unwrapping" except it doesn't care
 * about preserving geometry, it just cuts out every
 * triangle and splats it on the canvas.
 */
export default class SimpleUVSplatter {
	/**
	 * Allows texturing of EditableMesh instances by
	 * defining the UVs so that every triangle is
	 * unoccluded and without distortion.
	 */
	public static splatMesh(mesh: EditableMesh) {
		const triangles = mesh.GetTriangles();

		const triangleData = new Map<number, Map<number, Vector2>>();
		let totalWidth = 0;
		let totalHeight = 0;
		let maxHeight = 0;
		const padding = 4;

		for (const triangleId of triangles) {
			const [v0, v1, v2] = mesh.GetTriangleVertices(triangleId);
			// First, let's make sure our triangle lies parallel to the Z plane
			const points = [mesh.GetPosition(v0), mesh.GetPosition(v1), mesh.GetPosition(v2)];
			let [p0, p1, p2] = points;
			if (p0.Z === p1.Z && p1.Z === p2.Z) {
				// by transitivity we are parallel to the Z plane, so there isn't anything to be done
			} else {
				// let's rotate the triangle so it lies flat.
				[p0, p1, p2] = SimpleUVSplatter.rotateTriangleToXYPlane(p0, p1, p2);
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

			totalWidth += width + padding;
			totalHeight += height + padding;
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

	/**
	 * This is only public so it can be tested.
	 */
	public static rotateTriangleToXYPlane(p0: Vector3, p1: Vector3, p2: Vector3) {
		const p2subp0 = p2.sub(p0);
		const q1 = Vector3.xAxis.mul(p1.sub(p0).Magnitude);
		const q2x = p1.sub(p0).Dot(p2subp0) / q1.X;
		const q2 = new Vector3(q2x, math.sqrt(math.pow(p2subp0.Magnitude, 2) - q2x * q2x), 0);
		return [Vector3.zero, q1, q2];
	}
}

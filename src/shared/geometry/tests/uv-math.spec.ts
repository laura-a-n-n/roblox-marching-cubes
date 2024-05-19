import { PointCloud } from "shared/geometry/core/point-cloud";
import SimpleUVSplatter from "shared/geometry/core/painting/naive-uv-splatter";
import { TestModule, TestingFramework } from "shared/geometry/tests/testing-framework";

const UVMathTests: TestModule = {
	uvSplatter: {
		worksOnEmptyMesh: () => {
			try {
				const mesh = new Instance("EditableMesh");
				SimpleUVSplatter.splatMesh(mesh);
			} catch (e) {
				print(e);
				return false;
			}
			return true;
		},
		rotatesTrianglesCorrectly: (visualize = false) => {
			const TOLERANCE = 0.01;
			const points: [Vector3, Vector3, Vector3] = [
				new Vector3(1, 1, 1),
				new Vector3(4, 5, 6),
				new Vector3(2, 7, 4),
			];

			const [p0, p1, p2] = SimpleUVSplatter.rotateTriangleToXYPlane(...points);

			const passing = TestingFramework.checkAll([
				math.abs(p0.Z - p1.Z) < TOLERANCE,
				math.abs(p1.Z - p2.Z) < TOLERANCE,
				math.abs(p2.Z - p0.Z) < TOLERANCE,
			]);

			if (!visualize) {
				return passing;
			}
			const cloud = new PointCloud();
			cloud.setPoints(points);
			cloud.overrideAtomProperties({ BrickColor: new BrickColor("Really red") });
			cloud.setScale(1);
			cloud.setPoints([p0, p1, p2]);
			cloud.drawAtoms();
			cloud.render();

			return passing;
		},
	},
};

export default UVMathTests;

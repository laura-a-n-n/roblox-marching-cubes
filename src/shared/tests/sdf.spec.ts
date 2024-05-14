import Object from "@rbxts/object-utils";
import { compute3DGradient } from "shared/core/utils";
import { SDFLibrary } from "shared/extras/sdf-library";
import { TestModule, TestingFramework } from "shared/tests/testing-framework";

const random = new Random();

const SDFTests: TestModule = {
	sdfPrefabs: {
		sanityCheck: () => {
			return TestingFramework.checkAll([
				typeIs(SDFLibrary.Prefab.Sphere(Vector3.zero), "number"),
				typeIs(SDFLibrary.Prefab.Torus(Vector3.zero), "number"),
				typeIs(SDFLibrary.Prefab.Octahedron(Vector3.zero), "number"),
				typeIs(SDFLibrary.Prefab.Sphere(Vector3.one), "number"),
				typeIs(SDFLibrary.Prefab.Torus(Vector3.one), "number"),
				typeIs(SDFLibrary.Prefab.Octahedron(Vector3.one), "number"),
			]);
		},
		eikonalConstraint: (verbose = false) => {
			const NUM_TRIALS = 5;
			const NUMERICAL_DIFF_STEP = 0.0001;
			const TOLERANCE = 0.01;
			let passing = true;

			for (const [name, sdf] of Object.entries(SDFLibrary.Prefab)) {
				let total = 0;

				for (let i = 0; i < NUM_TRIALS; i++) {
					const randomPoint = random.NextUnitVector().mul(5);
					const gradient = compute3DGradient(
						sdf,
						randomPoint.X,
						randomPoint.Y,
						randomPoint.Z,
						NUMERICAL_DIFF_STEP,
					);
					const gradientNorm = gradient.Magnitude;
					if (verbose) {
						print("Gradient norm: ", gradientNorm);
					}
					total += gradientNorm;
				}

				const average = total / NUM_TRIALS;
				const thisPassing = math.abs(average - 1.0) < TOLERANCE;
				print(" -", name, thisPassing ? "✅" : "❌");
				passing &&= thisPassing;
			}

			return passing;
		},
	},
};

export default SDFTests;

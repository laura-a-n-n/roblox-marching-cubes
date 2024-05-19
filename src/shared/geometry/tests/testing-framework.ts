/**
 * A very minimal testing framework.
 * Just a quick solution until I get Jest running.
 * @module
 */
import Object from "@rbxts/object-utils";

export type TestModule = Record<string, TestSuite>;
export type TestSuite = Record<string, () => boolean>;

export class TestingFramework {
	public static runTests(allTests: TestModule[]) {
		let successes = 0;
		let attempted = 0;

		print(`🌸 Running tests from ${allTests.size()} test module(s) 🌸`);
		for (const testModule of allTests) {
			for (const [testSuiteName, cases] of Object.entries(testModule)) {
				print("✨ Test suite: ", testSuiteName);
				for (const [caseName, caseFunc] of Object.entries(cases)) {
					print(`🧪 Case ${caseName}`);
					const casePassed = caseFunc();
					attempted++;
					successes += casePassed ? 1 : 0;
					print(`${caseName} -> ${casePassed ? "passing ✅" : "failed ❌"}`);
				}
			}
		}
		const success = successes === attempted;
		print(success ? `All ${attempted} test cases passed! 🌱` : `${successes}/${attempted} test cases passed`);
		return success;
	}

	public static checkAll(cases: boolean[]) {
		return cases.reduce((a, b, index) => {
			if (!a) {
				print("Sanity checked failed on index", index);
			}
			return a && b;
		});
	}
}

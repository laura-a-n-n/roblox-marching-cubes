import SDFTests from "shared/geometry/tests/sdf.spec";
import { TestingFramework } from "shared/geometry/tests/testing-framework";
import UVMathTests from "shared/geometry/tests/uv-math.spec";

TestingFramework.runTests([SDFTests, UVMathTests]);

import MarchedMesh from "shared/geometry/core/marching-cubes/marched-mesh";
import SimpleUVSplatter from "shared/geometry/core/painting/naive-uv-splatter";
import { parentRandomColors } from "shared/geometry/core/painting/editable-image";
import { SignedDistanceFunction } from "shared/geometry/core/sdf";
import { SDFLibrary } from "shared/geometry/extras/sdf-library";
import { PointCloud } from "shared/geometry/core/point-cloud";

const Examples = {
	Torus: () => {
		const sdf = new SignedDistanceFunction(SDFLibrary.Prefab.Torus);
		const marchedMesh = new MarchedMesh(sdf.toMarchableGrid(64));
		marchedMesh.render();

		SimpleUVSplatter.splatMesh(marchedMesh.editableMesh);
		parentRandomColors(marchedMesh.meshPart);
	},

	PointCloud: () => {
		const sdf = new SignedDistanceFunction(SDFLibrary.Prefab.Octahedron);
		const pointCloud = new PointCloud();
		pointCloud.setPoints(sdf.sampleGrid(64).convergedPoints);
		pointCloud.render();
	},
};

export default Examples;

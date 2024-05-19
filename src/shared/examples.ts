import MarchedMesh from "shared/marching-cubes/marched-mesh";
import SimpleUVSplatter from "shared/painting/naive-uv-splatter";
import { parentRandomColors } from "shared/painting/editable-image";
import { SDFDefinition, SignedDistanceFunction } from "shared/core/sdf";
import { SDFLibrary } from "shared/extras/sdf-library";
import { PointCloud } from "shared/core/point-cloud";

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

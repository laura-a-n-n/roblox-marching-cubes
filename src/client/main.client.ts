import { parentRandomColors } from "shared/painting/editable-image";
import MarchedMesh from "shared/marching-cubes/marched-mesh";
import SimpleUVSplatter from "shared/painting/naive-uv-splatter";
import { PointCloud } from "shared/core/point-cloud";
import { SignedDistanceFunction } from "shared/core/sdf";
import { SDFLibrary } from "shared/extras/sdf-library";

const sdf = new SignedDistanceFunction(SDFLibrary.Prefab.Torus);
const pointCloud = new PointCloud(sdf);
const marchedMesh = new MarchedMesh(pointCloud);
// pointCloud.render();
pointCloud.sampleGrid();
marchedMesh.render();
// SimpleUVSplatter.simpleRotationTest();
SimpleUVSplatter.splatMesh(marchedMesh.editableMesh);
parentRandomColors(marchedMesh.meshPart);

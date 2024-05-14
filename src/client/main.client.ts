import MarchedMesh from "shared/marching-cubes/marched-mesh";
import SimpleUVSplatter from "shared/painting/naive-uv-splatter";
import { parentRandomColors } from "shared/painting/editable-image";
import { SDFDefinition, SignedDistanceFunction } from "shared/core/sdf";
import { SDFLibrary } from "shared/extras/sdf-library";
import { PointCloud } from "shared/core/point-cloud";

const sdf = new SignedDistanceFunction(SDFLibrary.Prefab.Torus);
const marchedMesh = new MarchedMesh(sdf);
marchedMesh.render();

const pointCloud = new PointCloud(sdf);
pointCloud.setPoints(sdf.sampleGrid(64));
pointCloud.render();

SimpleUVSplatter.splatMesh(marchedMesh.editableMesh);
parentRandomColors(marchedMesh.meshPart);

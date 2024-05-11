import MarchedMesh from "shared/marched-mesh";
import { PointCloud } from "shared/point-cloud";
import { getSimpleRays, getUVCoords, renderRaysDebug } from "shared/rays";
import { SignedDistanceFunction } from "shared/sdf";

const uvs = getUVCoords(6, 6);
const origin = new Vector3(0, 5, 0);
const rays = getSimpleRays(origin, uvs);

const sdf = new SignedDistanceFunction((v: Vector3) => v.Magnitude - 0.5);
const pointCloud = new PointCloud(sdf);
const marchedMesh = new MarchedMesh(pointCloud);
pointCloud.sampleGrid();
// pointCloud.render();
marchedMesh.render();

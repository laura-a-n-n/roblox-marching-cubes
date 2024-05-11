import MarchedMesh from "shared/marched-mesh";
import { PointCloud } from "shared/point-cloud";
import { getSimpleRays, getUVCoords, renderRaysDebug } from "shared/rays";
import { SignedDistanceFunction } from "shared/sdf";

// const uvs = getUVCoords(6, 6);
// const origin = new Vector3(0, 5, 0);
// const rays = getSimpleRays(origin, uvs);

function sdTorus(p: Vector3, t: Vector2): number {
	const q: Vector2 = new Vector2(math.abs(p.mul(Vector3.xAxis.add(Vector3.zAxis)).Magnitude) - t.X, p.Y);
	return q.Magnitude - t.Y;
}

const sdf = new SignedDistanceFunction((p: Vector3) => sdTorus(p, new Vector2(0.3, 0.15))); //(v: Vector3) => v.Magnitude - 0.5);
const pointCloud = new PointCloud(sdf);
const marchedMesh = new MarchedMesh(pointCloud);
pointCloud.sampleGrid();
marchedMesh.render();

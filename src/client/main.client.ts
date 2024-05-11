import { parentRandomColors } from "shared/editable-image";
import MarchedMesh from "shared/marched-mesh";
import SimpleUVSplatter from "shared/naive-uv-splatter";
import { PointCloud } from "shared/point-cloud";
import { getSimpleRays, getUVCoords, renderRaysDebug } from "shared/rays";
import { SignedDistanceFunction } from "shared/sdf";

// const uvs = getUVCoords(6, 6);
// const origin = new Vector3(0, 5, 0);
// const rays = getSimpleRays(origin, uvs);

const spherePrefab = (v: Vector3) => v.Magnitude - 0.5;

function sdTorus(p: Vector3, t: Vector2): number {
	const q: Vector2 = new Vector2(math.abs(p.mul(Vector3.xAxis.add(Vector3.zAxis)).Magnitude) - t.X, p.Y);
	return q.Magnitude - t.Y;
}
const torusPrefab = (p: Vector3) => sdTorus(p, new Vector2(0.3, 0.15));

function sdOctahedron(p: Vector3, s: number): number {
	p = p.Abs();
	const m: number = p.X + p.Y + p.Z - s;
	let q: Vector3;
	if (3.0 * p.X < m) q = p.mul(Vector3.one);
	else if (3.0 * p.Y < m) q = new Vector3(p.Y, p.Z, p.X);
	else if (3.0 * p.Z < m) q = new Vector3(p.Z, p.X, p.Y);
	else return m * 0.57735027;

	const k: number = math.clamp(0.5 * (q.Z - q.Y + s), 0, s);
	return new Vector3(q.X, q.Y - s + k, q.Z - k).Magnitude;
}
const octahedronPrefab = (p: Vector3) => sdOctahedron(p, 0.5);

const sdf = new SignedDistanceFunction(octahedronPrefab);
const pointCloud = new PointCloud(sdf);
const marchedMesh = new MarchedMesh(pointCloud);
// pointCloud.render();
pointCloud.sampleGrid();
marchedMesh.render();
// SimpleUVSplatter.simpleRotationTest();
SimpleUVSplatter.splatMesh(marchedMesh.editableMesh);
parentRandomColors(marchedMesh.meshPart);

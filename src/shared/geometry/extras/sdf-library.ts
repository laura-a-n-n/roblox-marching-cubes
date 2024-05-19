const Sphere = (v: Vector3, radius: number): number => v.Magnitude - radius;
const Torus = (p: Vector3, tX: number, tY: number): number => {
	const q: Vector2 = new Vector2(math.abs(p.mul(Vector3.xAxis.add(Vector3.zAxis)).Magnitude) - tX, p.Y);
	return q.Magnitude - tY;
};
const Octahedron = (p: Vector3, s: number): number => {
	p = p.Abs();
	const m: number = p.X + p.Y + p.Z - s;
	let q: Vector3;
	if (3.0 * p.X < m) q = p.mul(Vector3.one);
	else if (3.0 * p.Y < m) q = new Vector3(p.Y, p.Z, p.X);
	else if (3.0 * p.Z < m) q = new Vector3(p.Z, p.X, p.Y);
	else return m * 0.57735027;

	const k: number = math.clamp(0.5 * (q.Z - q.Y + s), 0, s);
	return new Vector3(q.X, q.Y - s + k, q.Z - k).Magnitude;
};

export const SDFLibrary = {
	Core: {
		Sphere,
		Torus,
		Octahedron,
	},
	Prefab: {
		Sphere: (v: Vector3) => Sphere(v, 0.5),
		Torus: (p: Vector3) => Torus(p, 0.3, 0.15),
		Octahedron: (p: Vector3) => Octahedron(p, 0.5),
	},
} as const;

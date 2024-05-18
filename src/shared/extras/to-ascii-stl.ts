const toFixed = (n: number) => tostring(math.floor(n)) + tostring(math.floor((n * 10) % 10));

const vector3ToStlFormat = (v: Vector3) => `${toFixed(v.X)} ${toFixed(v.Y)} ${toFixed(v.Z)}`;

export const editableMeshToAsciiStl = (mesh: EditableMesh, outPath?: Instance, name = "my_model") => {
	const triangles = mesh.GetTriangles();
	let source = "```stl\nsolid " + name;
	const INDENT = "  "; // two spaces
	for (const triangleId of triangles) {
		const vertices = mesh.GetTriangleVertices(triangleId);
		const normals = vertices.map((v) => mesh.GetVertexNormal(v));
		const faceNormal = normals.reduce((meanNormal, vertexNormal) => meanNormal.add(vertexNormal.div(3)));
		source += INDENT + "facet normal " + vector3ToStlFormat(faceNormal) + "\n";
		source += INDENT.rep(2) + "outer loop\n";
		for (const vertexId of vertices) {
			const vertex = mesh.GetPosition(vertexId);
			source += INDENT.rep(3) + "vertex " + vector3ToStlFormat(vertex) + "\n";
		}
		source += INDENT.rep(2) + "endloop\n";
		source += INDENT + "endfacet\n";
	}
	source += "endsolid\n```\n";

	return source;
};

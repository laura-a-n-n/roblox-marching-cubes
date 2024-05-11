export const parentRandomColors = (parent: MeshPart) => {
	const image = new Instance("EditableImage");
	image.Size = new Vector2(64, 64);
	const colors = generateRandomColors();
	image.WritePixels(Vector2.zero, image.Size, colors);
	image.Parent = parent;
};

function generateRandomColors(): number[] {
	const colors: number[] = [];

	for (let i = 0; i < 64; i++) {
		for (let j = 0; j < 64; j++) {
			for (let k = 0; k < 4; k++) {
				colors.push(math.random()); // Random value between 0 and 1 for each RGBA component
			}
		}
	}

	return colors;
}

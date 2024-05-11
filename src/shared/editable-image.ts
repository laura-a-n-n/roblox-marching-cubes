export const parentRandomColors = (parent: MeshPart) => {
	const image = new Instance("EditableImage");
	image.Size = new Vector2(64, 64);
	// const colors = generateGradient(new Color3(0.96, 0.5, 0.36), new Color3(0.64, 0.19, 0.07), 64 * 64);
	const colors = generateGradient(new Color3(1, 0.95, 0.93), new Color3(0.03, 0.03, 0.02), 64 * 64);
	// const colors = generateRainbow(64 * 64);
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

function generateGradient(startColor: Color3, endColor: Color3, steps: number): number[] {
	const gradient: number[] = [];

	for (let i = 0; i < steps; i++) {
		const t = i / (steps - 1);
		const r = startColor.R * (1 - t) + endColor.R * t;
		const g = startColor.G * (1 - t) + endColor.G * t;
		const b = startColor.B * (1 - t) + endColor.B * t;
		gradient.push(r, g, b, 1);
	}

	return gradient;
}

function generateRainbow(steps: number) {
	const rainbow: number[] = [];
	for (let i = 0; i < steps; i++) {
		const color = Color3.fromHSV(i / steps, 0.8, 0.6);
		rainbow.push(color.R, color.G, color.B, 1);
	}
	return rainbow;
}

import { flatCartesianProduct, range } from "../core/utils";

export const getUVCoords = (width: number, height: number) => {
	const horizontalAxis = range(width).map((x) => x / width - 0.5);
	const verticalAxis = range(height).map((y) => y / height - 0.5);
	return flatCartesianProduct<number>(horizontalAxis, verticalAxis);
};

export const getSimpleRays = (point: Vector3, uvs: number[][]) => {
	const result = [];
	for (const uv of uvs) {
		const targetPoint = new Vector3(uv[0], 0, uv[1]);
		result.push(targetPoint.Unit);
	}
	return result;
};

export const renderRaysDebug = (rayOrigin: Vector3, rayDirections: Vector3[], scale = 3) => {
	const part = new Instance("Part");
	part.Anchored = true;
	part.CanCollide = false;
	part.Shape = Enum.PartType.Ball;
	part.Size = Vector3.one;
	part.Position = rayOrigin;
	part.Parent = game.Workspace;

	const originAttachment = new Instance("Attachment");
	originAttachment.WorldPosition = rayOrigin;
	originAttachment.Parent = part;

	for (const direction of rayDirections) {
		const beamAttachment = new Instance("Attachment");
		beamAttachment.WorldPosition = originAttachment.WorldPosition.add(direction.mul(scale));
		beamAttachment.Parent = part;

		const beam = new Instance("Beam");
		beam.Attachment0 = originAttachment;
		beam.Attachment1 = beamAttachment;
		beam.Parent = originAttachment;
	}
};

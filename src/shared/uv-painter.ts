const UserInputService = game.GetService("UserInputService");

/**
 * Used to paint EditableMeshes!
 */
export default class UVPainterTool {
	// public tool: Tool;
	public debugMode = true;
	public rayDist = 100;
	private lastDebugPart?: Part;

	constructor(
		private wielder: Player,
		private camera: Camera,
		private meshPart: MeshPart,
		private editableMesh: EditableMesh,
	) {
		// this.tool = new Instance("Tool");
		// this.tool.Name = "Paintbrush";
		// this.tool.RequiresHandle = false; // maybe a cute little paintbrush or something later :)
		// this.tool.Activated.Connect(() => this.onActivate());
		// this.tool.Parent = wielder.WaitForChild("Backpack");
		UserInputService.InputChanged.Connect((input) => this.onActivate(input));
		print(wielder.FindFirstChild("Backpack")?.GetChildren());
	}

	private onActivate(input: InputObject) {
		if (
			input.UserInputType !== Enum.UserInputType.MouseMovement &&
			input.UserInputType !== Enum.UserInputType.Touch
		) {
			return;
		}
		const camera = this.camera;
		const mousePosition = UserInputService.GetMouseLocation();
		const ray = camera.ViewportPointToRay(mousePosition.X, mousePosition.Y);

		// this.renderDebug(ray);
		const relativeOrigin = this.meshPart.CFrame.PointToObjectSpace(ray.Origin);
		const relativeDirection = this.meshPart.CFrame.VectorToObjectSpace(ray.Direction.mul(this.rayDist));
		const raycast = this.editableMesh.RaycastLocal(relativeOrigin, relativeDirection);

		this.renderDebug(new Ray(relativeOrigin, relativeDirection));

		print(raycast);
		if (raycast[0] !== undefined) {
			this.editableMesh.SetVertexColor(raycast[0], new Color3(1, 0, 0));
		}
	}

	private renderDebug(ray: Ray) {
		if (!this.debugMode) {
			return;
		}
		this.lastDebugPart?.Destroy();
		const debugPart = new Instance("Part");
		debugPart.Anchored = true;
		debugPart.Transparency = 1;
		debugPart.CanCollide = false;
		debugPart.Position = ray.Origin;
		const nearAttachment = new Instance("Attachment");
		const farAttachment = new Instance("Attachment");
		farAttachment.Parent = debugPart;
		nearAttachment.Parent = debugPart;
		farAttachment.WorldPosition = ray.Origin.add(ray.Direction.mul(this.rayDist));
		const beam = new Instance("Beam");
		beam.Attachment0 = nearAttachment;
		beam.Attachment1 = farAttachment;
		beam.Width0 = 0.2;
		beam.Width1 = 0.2;
		beam.Parent = debugPart;
		this.lastDebugPart = debugPart;
		debugPart.Parent = game.Workspace;
	}
}

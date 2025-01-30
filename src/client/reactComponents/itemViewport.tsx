import React from "@rbxts/react";
import { RunService} from "@rbxts/services";

interface ViewportModelProps {
	model: Model;
	spin?: boolean;
	size?: UDim2;
	backgroundColor?: Color3;
	position?: UDim2;
}

const ViewportModel: React.FC<Readonly<ViewportModelProps>> = (props) => {
	const viewportRef = React.createRef<ViewportFrame>();

	React.useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) {
			return;
		}

		// Clear previous content to prevent accumulation
		viewport.ClearAllChildren();

		// Create a WorldModel inside the ViewportFrame
		const worldModel = new Instance("WorldModel");
		worldModel.Parent = viewport;

		// Clone the model to display
		const model = props.model.Clone();
		model.Parent = worldModel;

		// Ensure the model has a PrimaryPart for rotation
		if (!model.PrimaryPart) {
			const primaryPart = model.FindFirstChildWhichIsA("BasePart", true);
			if (primaryPart) {
				model.PrimaryPart = primaryPart;
			} else {
				warn("ViewportModel: The provided model has no BasePart to set as PrimaryPart.");
				return;
			}
		}

		const camera = new Instance("Camera");
		camera.Parent = viewport;
		camera.CameraType = Enum.CameraType.Scriptable;
		viewport.CurrentCamera = camera;

		// Calculate the bounding box of the model
		const [modelCFrame, size] = model.GetBoundingBox();
		const cameraOffset = new Vector3(0, size.Y, size.Magnitude);
		camera.CFrame = new CFrame(modelCFrame.Position.add(cameraOffset), modelCFrame.Position);

		// Spinning logic
		let connection: RBXScriptConnection | undefined;
		let rotation = 0;

		if (props.spin) {
			// Rotate the model slowly
			connection = RunService.RenderStepped.Connect((deltaTime) => {
				const SPEED = 20;
				rotation += deltaTime * SPEED; // Adjust speed as needed (degrees per second)
				// Reset rotation after full circle to prevent large numbers
				if (rotation >= 360) {
					rotation -= 360;
				}
				model.PivotTo(modelCFrame.mul(CFrame.Angles(0, math.rad(rotation), 0)));
			});
		} else {
			// Ensure the model is at its original orientation
			model.PivotTo(modelCFrame);
		}

		// Cleanup function to destroy instances when the component unmounts
		return () => {
			if (connection) {
				connection.Disconnect();
				connection = undefined;
			}
			if (worldModel.Parent) {
				worldModel.Destroy();
			}
			if (camera.Parent) {
				camera.Destroy();
			}
		};
	}, [props.model, props.spin]); // Re-run effect if props.model or props.spin changes

	return React.createElement("ViewportFrame", {
		Size: props.size ?? new UDim2(0, 200, 0, 200),
		BackgroundColor3: props.backgroundColor ?? new Color3(1, 1, 1),
		Position: props.position ?? new UDim2(0.457, 0, 0.5, 0),
		AnchorPoint: new Vector2(0.5, 0.5),
		BackgroundTransparency: 1,
		ref: viewportRef,
	});
};

export default ViewportModel;

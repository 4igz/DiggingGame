//!optimize 2
//!native
import { Controller, OnStart } from "@flamework/core";

import { UserInputService, ProximityPromptService, TweenService, TextService, Players } from "@rbxts/services";

const LocalPlayer = Players.LocalPlayer!;
const PlayerGui = LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;

// Mapping from KeyCode to images
const GamepadButtonImage: Record<string, string | undefined> = {
	[Enum.KeyCode.ButtonX.Name]: "rbxasset://textures/ui/Controls/xboxX.png",
	[Enum.KeyCode.ButtonY.Name]: "rbxasset://textures/ui/Controls/xboxY.png",
	[Enum.KeyCode.ButtonA.Name]: "rbxasset://textures/ui/Controls/xboxA.png",
	[Enum.KeyCode.ButtonB.Name]: "rbxasset://textures/ui/Controls/xboxB.png",
	[Enum.KeyCode.DPadLeft.Name]: "rbxasset://textures/ui/Controls/dpadLeft.png",
	[Enum.KeyCode.DPadRight.Name]: "rbxasset://textures/ui/Controls/dpadRight.png",
	[Enum.KeyCode.DPadUp.Name]: "rbxasset://textures/ui/Controls/dpadUp.png",
	[Enum.KeyCode.DPadDown.Name]: "rbxasset://textures/ui/Controls/dpadDown.png",
	[Enum.KeyCode.ButtonSelect.Name]: "rbxasset://textures/ui/Controls/xboxmenu.png",
	[Enum.KeyCode.ButtonL1.Name]: "rbxasset://textures/ui/Controls/xboxLS.png",
	[Enum.KeyCode.ButtonR1.Name]: "rbxasset://textures/ui/Controls/xboxRS.png",
};

// Keyboard images
const KeyboardButtonImage: Record<string, string | undefined> = {
	[Enum.KeyCode.Backspace.Name]: "rbxasset://textures/ui/Controls/backspace.png",
	[Enum.KeyCode.Return.Name]: "rbxasset://textures/ui/Controls/return.png",
	[Enum.KeyCode.LeftShift.Name]: "rbxasset://textures/ui/Controls/shift.png",
	[Enum.KeyCode.RightShift.Name]: "rbxasset://textures/ui/Controls/shift.png",
	[Enum.KeyCode.Tab.Name]: "rbxasset://textures/ui/Controls/tab.png",
};

// Special punctuation to icon mapping
const KeyboardButtonIconMapping: Record<string, string | undefined> = {
	["'"]: "rbxasset://textures/ui/Controls/apostrophe.png",
	[","]: "rbxasset://textures/ui/Controls/comma.png",
	["`"]: "rbxasset://textures/ui/Controls/graveaccent.png",
	["."]: "rbxasset://textures/ui/Controls/period.png",
	[" "]: "rbxasset://textures/ui/Controls/spacebar.png",
};

// KeyCode to text mapping
const KeyCodeToTextMapping: Record<string, string | undefined> = {
	[Enum.KeyCode.LeftControl.Name]: "Ctrl",
	[Enum.KeyCode.RightControl.Name]: "Ctrl",
	[Enum.KeyCode.LeftAlt.Name]: "Alt",
	[Enum.KeyCode.RightAlt.Name]: "Alt",
	[Enum.KeyCode.F1.Name]: "F1",
	[Enum.KeyCode.F2.Name]: "F2",
	[Enum.KeyCode.F3.Name]: "F3",
	[Enum.KeyCode.F4.Name]: "F4",
	[Enum.KeyCode.F5.Name]: "F5",
	[Enum.KeyCode.F6.Name]: "F6",
	[Enum.KeyCode.F7.Name]: "F7",
	[Enum.KeyCode.F8.Name]: "F8",
	[Enum.KeyCode.F9.Name]: "F9",
	[Enum.KeyCode.F10.Name]: "F10",
	[Enum.KeyCode.F11.Name]: "F11",
	[Enum.KeyCode.F12.Name]: "F12",
};

function getScreenGui(): ScreenGui {
	let screenGui = PlayerGui.FindFirstChild("ProximityPrompts") as ScreenGui | undefined;
	if (!screenGui) {
		screenGui = new Instance("ScreenGui");
		screenGui.Name = "ProximityPrompts";
		screenGui.ResetOnSpawn = false;
		screenGui.Parent = PlayerGui;
	}
	return screenGui;
}

function createProgressBarGradient(parent: Frame, leftSide: boolean): UIGradient {
	const frame = new Instance("Frame");
	frame.Size = new UDim2(0.5, 0, 1, 0);
	frame.Position = new UDim2(leftSide ? 0 : 0.5, 0, 0, 0);
	frame.BackgroundTransparency = 1;
	frame.ClipsDescendants = true;
	frame.Parent = parent;

	const image = new Instance("ImageLabel");
	image.BackgroundTransparency = 1;
	image.Size = new UDim2(2, 0, 1, 0);
	image.Position = new UDim2(leftSide ? 0 : -1, 0, 0, 0);
	image.Image = "rbxasset://textures/ui/Controls/RadialFill.png";
	image.Parent = frame;

	const gradient = new Instance("UIGradient");
	gradient.Transparency = new NumberSequence([
		new NumberSequenceKeypoint(0, 0),
		new NumberSequenceKeypoint(0.4999, 0),
		new NumberSequenceKeypoint(0.5, 1),
		new NumberSequenceKeypoint(1, 1),
	]);
	gradient.Rotation = leftSide ? 180 : 0;
	gradient.Parent = image;

	return gradient;
}

function createCircularProgressBar(): Frame {
	const bar = new Instance("Frame");
	bar.Name = "CircularProgressBar";
	bar.Size = new UDim2(0, 58, 0, 58);
	bar.AnchorPoint = new Vector2(0.5, 0.5);
	bar.Position = new UDim2(0.5, 0, 0.5, 0);
	bar.BackgroundTransparency = 1;

	const gradient1 = createProgressBarGradient(bar, true);
	const gradient2 = createProgressBarGradient(bar, false);

	const progress = new Instance("NumberValue");
	progress.Name = "Progress";
	progress.Parent = bar;

	progress.Changed.Connect((value) => {
		const angle = math.clamp((value as number) * 360, 0, 360);
		gradient1.Rotation = math.clamp(angle, 180, 360);
		gradient2.Rotation = math.clamp(angle, 0, 180);
	});

	return bar;
}

function createPrompt(
	prompt: ProximityPrompt & { Changed: RBXScriptSignal<(property: string) => void> },
	inputType: Enum.ProximityPromptInputType,
	gui: ScreenGui,
): () => void {
	// Arrays (formerly Lua tables) for tweens
	const tweensForButtonHoldBegin = new Array<Tween>();
	const tweensForButtonHoldEnd = new Array<Tween>();
	const tweensForFadeOut = new Array<Tween>();
	const tweensForFadeIn = new Array<Tween>();

	const tweenInfoInFullDuration = new TweenInfo(
		prompt.HoldDuration,
		Enum.EasingStyle.Linear,
		Enum.EasingDirection.Out,
	);
	const tweenInfoOutHalfSecond = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
	const tweenInfoFast = new TweenInfo(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
	const tweenInfoQuick = new TweenInfo(0.06, Enum.EasingStyle.Linear, Enum.EasingDirection.Out);

	const promptUI = new Instance("BillboardGui");
	promptUI.Name = "Prompt";
	promptUI.AlwaysOnTop = true;

	const frame = new Instance("Frame");
	frame.Size = new UDim2(0.5, 0, 1, 0);
	frame.BackgroundTransparency = 1;
	frame.BackgroundColor3 = new Color3(0.07, 0.07, 0.07);
	frame.Parent = promptUI;

	const roundedCorner = new Instance("UICorner");
	roundedCorner.Parent = frame;

	const inputFrame = new Instance("Frame");
	inputFrame.Name = "InputFrame";
	inputFrame.Size = new UDim2(1, 0, 1, 0);
	inputFrame.BackgroundTransparency = 1;
	inputFrame.SizeConstraint = Enum.SizeConstraint.RelativeYY;
	inputFrame.Parent = frame;

	const resizeableInputFrame = new Instance("Frame");
	resizeableInputFrame.Size = new UDim2(1, 0, 1, 0);
	resizeableInputFrame.Position = new UDim2(0.5, 0, 0.5, 0);
	resizeableInputFrame.AnchorPoint = new Vector2(0.5, 0.5);
	resizeableInputFrame.BackgroundTransparency = 1;
	resizeableInputFrame.Parent = inputFrame;

	const inputFrameScaler = new Instance("UIScale");
	inputFrameScaler.Parent = resizeableInputFrame;

	const inputFrameScaleFactor = inputType === Enum.ProximityPromptInputType.Touch ? 1.6 : 1.33;
	tweensForButtonHoldBegin.push(
		TweenService.Create(inputFrameScaler, tweenInfoFast, { Scale: inputFrameScaleFactor }),
	);
	tweensForButtonHoldEnd.push(TweenService.Create(inputFrameScaler, tweenInfoFast, { Scale: 1 }));

	const actionText = new Instance("TextLabel");
	actionText.Name = "ActionText";
	actionText.Size = new UDim2(1, 0, 1, 0);
	actionText.Font = Enum.Font.BuilderSansBold;
	actionText.TextSize = 23;
	actionText.BackgroundTransparency = 1;
	actionText.TextTransparency = 1;
	actionText.TextColor3 = new Color3(1, 1, 1);
	actionText.TextXAlignment = Enum.TextXAlignment.Left;
	actionText.Parent = frame;
	tweensForButtonHoldBegin.push(TweenService.Create(actionText, tweenInfoFast, { TextTransparency: 1 }));
	tweensForButtonHoldEnd.push(TweenService.Create(actionText, tweenInfoFast, { TextTransparency: 0 }));
	tweensForFadeOut.push(TweenService.Create(actionText, tweenInfoFast, { TextTransparency: 1 }));
	tweensForFadeIn.push(TweenService.Create(actionText, tweenInfoFast, { TextTransparency: 0 }));

	const objectText = new Instance("TextLabel");
	objectText.Name = "ObjectText";
	objectText.Size = new UDim2(1, 0, 1, 0);
	objectText.Font = Enum.Font.BuilderSansBold;
	objectText.TextSize = 18;
	objectText.BackgroundTransparency = 1;
	objectText.TextTransparency = 1;
	objectText.TextColor3 = new Color3(0.7, 0.7, 0.7);
	objectText.TextXAlignment = Enum.TextXAlignment.Left;
	objectText.Parent = frame;

	tweensForButtonHoldBegin.push(TweenService.Create(objectText, tweenInfoFast, { TextTransparency: 1 }));
	tweensForButtonHoldEnd.push(TweenService.Create(objectText, tweenInfoFast, { TextTransparency: 0 }));
	tweensForFadeOut.push(TweenService.Create(objectText, tweenInfoFast, { TextTransparency: 1 }));
	tweensForFadeIn.push(TweenService.Create(objectText, tweenInfoFast, { TextTransparency: 0 }));

	tweensForButtonHoldBegin.push(
		TweenService.Create(frame, tweenInfoFast, {
			Size: new UDim2(0.5, 0, 1, 0),
			BackgroundTransparency: 1,
		}),
	);
	tweensForButtonHoldEnd.push(
		TweenService.Create(frame, tweenInfoFast, {
			Size: new UDim2(1, 0, 1, 0),
			BackgroundTransparency: 0.2,
		}),
	);
	tweensForFadeOut.push(
		TweenService.Create(frame, tweenInfoFast, {
			Size: new UDim2(0.5, 0, 1, 0),
			BackgroundTransparency: 1,
		}),
	);
	tweensForFadeIn.push(
		TweenService.Create(frame, tweenInfoFast, {
			Size: new UDim2(1, 0, 1, 0),
		}),
	);

	const roundFrame = new Instance("Frame");
	roundFrame.Name = "RoundFrame";
	roundFrame.Size = new UDim2(0, 48, 0, 48);
	roundFrame.AnchorPoint = new Vector2(0.5, 0.5);
	roundFrame.Position = new UDim2(0.5, 0, 0.5, 0);
	roundFrame.BackgroundTransparency = 1;
	roundFrame.BackgroundColor3 = new Color3(0.4, 0.4, 0.4);
	roundFrame.Parent = resizeableInputFrame;

	const roundedFrameCorner = new Instance("UICorner");
	roundedFrameCorner.CornerRadius = new UDim(0.5, 0);
	roundedFrameCorner.Parent = roundFrame;

	tweensForFadeOut.push(TweenService.Create(roundFrame, tweenInfoQuick, { BackgroundTransparency: 1 }));
	tweensForFadeIn.push(TweenService.Create(roundFrame, tweenInfoQuick, { BackgroundTransparency: 0.5 }));

	// Handle different input icons
	if (inputType === Enum.ProximityPromptInputType.Gamepad) {
		const gamepadImage = GamepadButtonImage[prompt.GamepadKeyCode.Name];
		if (gamepadImage) {
			const icon = new Instance("ImageLabel");
			icon.Name = "ButtonImage";
			icon.AnchorPoint = new Vector2(0.5, 0.5);
			icon.Size = new UDim2(0, 24, 0, 24);
			icon.Position = new UDim2(0.5, 0, 0.5, 0);
			icon.BackgroundTransparency = 1;
			icon.ImageTransparency = 1;
			icon.Image = gamepadImage;
			icon.Parent = resizeableInputFrame;
			tweensForFadeOut.push(TweenService.Create(icon, tweenInfoQuick, { ImageTransparency: 1 }));
			tweensForFadeIn.push(TweenService.Create(icon, tweenInfoQuick, { ImageTransparency: 0 }));
		}
	} else if (inputType === Enum.ProximityPromptInputType.Touch) {
		const buttonImage = new Instance("ImageLabel");
		buttonImage.Name = "ButtonImage";
		buttonImage.BackgroundTransparency = 1;
		buttonImage.ImageTransparency = 1;
		buttonImage.Size = new UDim2(0, 25, 0, 31);
		buttonImage.AnchorPoint = new Vector2(0.5, 0.5);
		buttonImage.Position = new UDim2(0.5, 0, 0.5, 0);
		buttonImage.Image = "rbxasset://textures/ui/Controls/TouchTapIcon.png";
		buttonImage.Parent = resizeableInputFrame;

		tweensForFadeOut.push(TweenService.Create(buttonImage, tweenInfoQuick, { ImageTransparency: 1 }));
		tweensForFadeIn.push(TweenService.Create(buttonImage, tweenInfoQuick, { ImageTransparency: 0 }));
	} else {
		// Keyboard or other
		const buttonImage = new Instance("ImageLabel");
		buttonImage.Name = "ButtonImage";
		buttonImage.BackgroundTransparency = 1;
		buttonImage.ImageTransparency = 1;
		buttonImage.Size = new UDim2(0, 28, 0, 30);
		buttonImage.AnchorPoint = new Vector2(0.5, 0.5);
		buttonImage.Position = new UDim2(0.5, 0, 0.5, 0);
		buttonImage.Image = "rbxasset://textures/ui/Controls/key_single.png";
		buttonImage.Parent = resizeableInputFrame;
		tweensForFadeOut.push(TweenService.Create(buttonImage, tweenInfoQuick, { ImageTransparency: 1 }));
		tweensForFadeIn.push(TweenService.Create(buttonImage, tweenInfoQuick, { ImageTransparency: 0 }));

		let buttonTextString = UserInputService.GetStringForKeyCode(prompt.KeyboardKeyCode);
		let buttonTextImage = KeyboardButtonImage[prompt.KeyboardKeyCode.Name];

		if (!buttonTextImage) {
			buttonTextImage = KeyboardButtonIconMapping[buttonTextString];
		}
		if (!buttonTextImage) {
			const keyCodeMappedText = KeyCodeToTextMapping[prompt.KeyboardKeyCode.Name];
			if (keyCodeMappedText) {
				buttonTextString = keyCodeMappedText;
			}
		}

		if (buttonTextImage) {
			const icon = new Instance("ImageLabel");
			icon.Name = "ButtonImage";
			icon.AnchorPoint = new Vector2(0.5, 0.5);
			icon.Size = new UDim2(0, 36, 0, 36);
			icon.Position = new UDim2(0.5, 0, 0.5, 0);
			icon.BackgroundTransparency = 1;
			icon.ImageTransparency = 1;
			icon.Image = buttonTextImage;
			icon.Parent = resizeableInputFrame;
			tweensForFadeOut.push(TweenService.Create(icon, tweenInfoQuick, { ImageTransparency: 1 }));
			tweensForFadeIn.push(TweenService.Create(icon, tweenInfoQuick, { ImageTransparency: 0 }));
		} else if (buttonTextString && buttonTextString !== "") {
			const buttonText = new Instance("TextLabel");
			buttonText.Name = "ButtonText";
			buttonText.Position = new UDim2(0, 0, 0, -1);
			buttonText.Size = new UDim2(1, 0, 1, 0);
			buttonText.Font = Enum.Font.BuilderSansBold;
			buttonText.TextSize = 14;
			if (buttonTextString.size() > 2) {
				buttonText.TextSize = 12;
			}
			buttonText.BackgroundTransparency = 1;
			buttonText.TextTransparency = 1;
			buttonText.TextColor3 = new Color3(1, 1, 1);
			buttonText.TextXAlignment = Enum.TextXAlignment.Center;
			buttonText.Text = buttonTextString;
			buttonText.Parent = resizeableInputFrame;
			tweensForFadeOut.push(TweenService.Create(buttonText, tweenInfoQuick, { TextTransparency: 1 }));
			tweensForFadeIn.push(TweenService.Create(buttonText, tweenInfoQuick, { TextTransparency: 0 }));
		} else {
			error(
				`ProximityPrompt '${prompt.Name}' has an unsupported keycode for rendering UI: ${tostring(
					prompt.KeyboardKeyCode,
				)}`,
			);
		}
	}

	// If it's touch or clickable, create a 'button' region
	if (inputType === Enum.ProximityPromptInputType.Touch || prompt.ClickablePrompt) {
		const button = new Instance("TextButton");
		button.BackgroundTransparency = 1;
		button.TextTransparency = 1;
		button.Size = new UDim2(1, 0, 1, 0);
		button.Parent = promptUI;

		let buttonDown = false;

		button.InputBegan.Connect((input) => {
			if (
				(input.UserInputType === Enum.UserInputType.Touch ||
					input.UserInputType === Enum.UserInputType.MouseButton1) &&
				input.UserInputState !== Enum.UserInputState.Change
			) {
				prompt.InputHoldBegin();
				buttonDown = true;
			}
		});
		button.InputEnded.Connect((input) => {
			if (
				input.UserInputType === Enum.UserInputType.Touch ||
				input.UserInputType === Enum.UserInputType.MouseButton1
			) {
				if (buttonDown) {
					buttonDown = false;
					prompt.InputHoldEnd();
				}
			}
		});

		promptUI.Active = true;
	}

	// If hold prompt, add circular progress bar
	if (prompt.HoldDuration > 0) {
		const circleBar = createCircularProgressBar();
		circleBar.Parent = resizeableInputFrame;
		tweensForButtonHoldBegin.push(
			TweenService.Create(circleBar.FindFirstChild("Progress") as NumberValue, tweenInfoInFullDuration, {
				Value: 1,
			}),
		);
		tweensForButtonHoldEnd.push(
			TweenService.Create(circleBar.FindFirstChild("Progress") as NumberValue, tweenInfoOutHalfSecond, {
				Value: 0,
			}),
		);
	}

	let holdBeganConnection: RBXScriptConnection | undefined;
	let holdEndedConnection: RBXScriptConnection | undefined;
	let triggeredConnection: RBXScriptConnection | undefined;
	let triggerEndedConnection: RBXScriptConnection | undefined;

	if (prompt.HoldDuration > 0) {
		holdBeganConnection = prompt.PromptButtonHoldBegan.Connect(() => {
			for (const tween of tweensForButtonHoldBegin) {
				tween.Play();
			}
		});
		holdEndedConnection = prompt.PromptButtonHoldEnded.Connect(() => {
			for (const tween of tweensForButtonHoldEnd) {
				tween.Play();
			}
		});
	}

	triggeredConnection = prompt.Triggered.Connect(() => {
		for (const tween of tweensForFadeOut) {
			tween.Play();
		}
	});

	triggerEndedConnection = prompt.TriggerEnded.Connect(() => {
		for (const tween of tweensForFadeIn) {
			tween.Play();
		}
	});

	function updateUIFromPrompt() {
		const actionTextSize = TextService.GetTextSize(
			prompt.ActionText,
			19,
			Enum.Font.BuilderSansBold,
			new Vector2(1000, 1000),
		);
		const objectTextSize = TextService.GetTextSize(
			prompt.ObjectText,
			14,
			Enum.Font.BuilderSansBold,
			new Vector2(1000, 1000),
		);
		const maxTextWidth = math.max(actionTextSize.X, objectTextSize.X);
		let promptHeight = 72;
		let promptWidth = 72;
		const textPaddingLeft = 72;

		if ((prompt.ActionText && prompt.ActionText !== "") || (prompt.ObjectText && prompt.ObjectText !== "")) {
			promptWidth = maxTextWidth + textPaddingLeft + 24;
		}

		let actionTextYOffset = 0;
		if (prompt.ObjectText && prompt.ObjectText !== "") {
			actionTextYOffset = 9;
		}
		actionText.Position = new UDim2(0.5, textPaddingLeft - promptWidth / 2, 0, actionTextYOffset);
		objectText.Position = new UDim2(0.5, textPaddingLeft - promptWidth / 2, 0, -10);

		actionText.Text = prompt.ActionText;
		objectText.Text = prompt.ObjectText;

		// Localization (if needed)
		actionText.AutoLocalize = prompt.AutoLocalize;
		actionText.RootLocalizationTable = prompt.RootLocalizationTable;
		objectText.AutoLocalize = prompt.AutoLocalize;
		objectText.RootLocalizationTable = prompt.RootLocalizationTable;

		promptUI.Size = new UDim2(0, promptWidth, 0, promptHeight);
		promptUI.SizeOffset = new Vector2(
			prompt.UIOffset.X / promptUI.Size.Width.Offset,
			prompt.UIOffset.Y / promptUI.Size.Height.Offset,
		);
	}

	const changedConnection = prompt.Changed.Connect(updateUIFromPrompt);
	updateUIFromPrompt();

	promptUI.Adornee = prompt.Parent as BasePart;
	promptUI.Parent = gui;

	// Initially fade in
	for (const tween of tweensForFadeIn) {
		tween.Play();
	}

	function cleanup() {
		if (holdBeganConnection) {
			holdBeganConnection.Disconnect();
		}
		if (holdEndedConnection) {
			holdEndedConnection.Disconnect();
		}
		if (triggeredConnection) {
			triggeredConnection.Disconnect();
		}
		if (triggerEndedConnection) {
			triggerEndedConnection.Disconnect();
		}
		if (changedConnection) {
			changedConnection.Disconnect();
		}

		for (const tween of tweensForFadeOut) {
			tween.Play();
		}

		task.wait(0.2);
		promptUI.Parent = undefined;
	}

	return cleanup;
}

function onLoad() {
	ProximityPromptService.PromptShown.Connect((prompt, inputType) => {
		// Because calling prompt.PromptHidden.Wait() blocks the current thread,
		// we spawn a separate thread to replicate the same blocking logic from Lua:
		task.spawn(() => {
			if (prompt.Style === Enum.ProximityPromptStyle.Default) {
				return;
			}

			const gui = getScreenGui();
			const cleanupFunction = createPrompt(
				prompt as ProximityPrompt & { Changed: RBXScriptSignal<(property: string) => void> },
				inputType,
				gui,
			);

			prompt.PromptHidden.Wait();

			cleanupFunction();
		});
	});
}

@Controller({})
export class PromptController implements OnStart {
	onStart() {
		onLoad();
	}
}

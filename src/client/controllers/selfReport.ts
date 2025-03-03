//!optimize 2
import Object from "@rbxts/object-utils";
import { Players, ReplicatedFirst, ReplicatedStorage, RunService, ScriptContext, Workspace } from "@rbxts/services";
import { Events } from "client/network";

// Basic fly check
const flyCheck = (character: Model) => {
	character.DescendantAdded.Connect((descendant) => {
		if (descendant.IsA("BodyGyro") || descendant.IsA("BodyVelocity") || descendant.IsA("AngularVelocity")) {
			Events.selfReport("Flying");
		}
		if (descendant.IsA("HopperBin" as "Tool")) {
			Events.selfReport("HopperBin");
		}
	});
};

const humanoidProps = {
	WalkSpeed: 16,
	JumpHeight: 7.2,
	JumpPower: 50,
};

const propertyCheck = (character: Model) => {
	const humanoid = character.WaitForChild("Humanoid") as Humanoid;
	for (const [propName, maxValue] of Object.entries(humanoidProps)) {
		humanoid.GetPropertyChangedSignal(propName as keyof typeof humanoidProps).Connect(() => {
			const newValue = humanoid[propName] as number;
			if (newValue > maxValue) {
				humanoid[propName] = maxValue;
				Events.selfReport("HumanoidEdit");
			}
		});
	}

	humanoid.StateEnabledChanged.Connect((state, isEnabled) => {
		if (state === Enum.HumanoidStateType.Dead && !isEnabled) {
			Events.selfReport("FEGod (StateChange)");
		}
	});
	character.ChildRemoved.Connect((child) => {
		if (child.IsA("Humanoid") && child === humanoid) {
			Events.selfReport("FEGod (NoHumanoid)");
		}
	});
};

const initCharacterDetections = (character: Model) => {
	flyCheck(character);
	propertyCheck(character);
};

const scriptNameCheck = (name: string) => {
	if (name === script.Name) {
		return true;
	}
	const character = Players.LocalPlayer.Character as Model | undefined;
	const containersToCheck = [ReplicatedFirst, ReplicatedStorage, Players.LocalPlayer, character];
	for (const container of containersToCheck) {
		if (!container) continue;
		for (const descendant of container.GetDescendants()) {
			if (descendant.IsA("LocalScript") || descendant.IsA("ModuleScript") || descendant.IsA("Script")) {
				if (descendant.Name === name) {
					return true;
				}
			}
		}
	}
	return false;
};

const physicsFPSCheck = () => {
	const physicsFPS = Workspace.GetRealPhysicsFPS();
	if (physicsFPS > 65) {
		Events.selfReport("Speed Hacking (PhysicsFPS)");
	}
};

// Exploiters Self-Report if they hit any of our detections.
// They are not banned, they are only silently flagged as exploiters.
task.spawn(() => {
	const someCharacter = Players.LocalPlayer.Character;
	if (someCharacter) {
		initCharacterDetections(someCharacter);
	}

	Players.LocalPlayer.CharacterAdded.Connect((character) => {
		initCharacterDetections(character);
	});

	/** RenderStep binding for physics checks */
	RunService.BindToRenderStep("PhysicsFPSCheck", Enum.RenderPriority.First.Value, physicsFPSCheck);

	Workspace.GetPropertyChangedSignal("Gravity").Connect(() => {
		Events.selfReport("GravityMod");
	});

	ScriptContext.Error.Connect((_message, stackTrace, source) => {
		// Attempt to parse the script name from stackTrace
		const [i, j] = string.find(stackTrace, ", line");
		if (i && j) {
			const scriptName = string.sub(stackTrace, 1, i - 1);
			if (!source) {
				// Check if we can find that script name anywhere
				// Otherwise, it's a script that doesn't exist in the game
				// and is likely an erroring exploit script.
				const validScript = scriptNameCheck(scriptName);
				if (!validScript) {
					if (RunService.IsStudio()) {
						warn("Error in Studio triggered a self-report");
						return;
					}
					Events.selfReport("CustomScript");
				}
			}
		}
	});
});

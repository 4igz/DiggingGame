import { Controller, OnStart } from "@flamework/core";
import { Players, ReplicatedStorage, RunService, TweenService, Workspace } from "@rbxts/services";
import { Events } from "client/network";
import { ObjectPool } from "shared/util/objectPool";

const MAX_BUBBLES = 15;

@Controller({})
export class SellBubbleController implements OnStart {
	private bubble = ReplicatedStorage.WaitForChild("Assets").WaitForChild("VFX").WaitForChild("CashBubble") as Model;

	private bubblePool = new ObjectPool(() => {
		return this.bubble.Clone();
	}, 15);

	onStart() {
		Events.soldAllItems.connect((sellCount) => {
			this.createCashBubbles(math.min(MAX_BUBBLES, math.floor(sellCount / 2)));
		});

		task.delay(5, () => {
			this.createCashBubbles(MAX_BUBBLES);
		});
	}

	createCashBubbles(amt: number = 1) {
		let startPivot = Players.LocalPlayer.Character?.GetPivot();
		if (!startPivot) return;

		for (let i = 0; i < amt; i++) {
			const bubble = this.bubblePool.acquire();

			// Parent the bubble to workspace so it is visible
			bubble.Parent = Workspace;

			// Position bubble randomly in a circle around the player
			const radius = 10;
			const angle = math.random() * 2 * math.pi;
			const offset = new Vector3(
				math.cos(angle) * radius,
				math.random() * 5 + 2, // random height between 2 and 7 studs
				math.sin(angle) * radius,
			);

			const startPos = startPivot.Position.add(offset);
			const startCFrame = new CFrame(startPos);
			const bubblePrimary = bubble.PrimaryPart;
			if (!bubblePrimary) {
				this.bubblePool.release(bubble);
				continue;
			}
			// bubblePrimary.CFrame = startCFrame;
			bubble.PivotTo(startCFrame);

			task.delay(0.2, () => {
				let fallenCframe = bubble.GetPivot();
				// First, float above ground for a short duration before attracting to player
				const floatDuration = 1.5;
				const attractDuration = 0.4;
				let floatElapsed = 0;

				const floatConnection = RunService.RenderStepped.Connect((dt) => {
					floatElapsed += dt;
					// Keep bubble at its fallenCframe position
					const bobHeight = 0.5;
					const bobSpeed = 4;
					const bobOffset = math.sin(tick() * bobSpeed + i) * bobHeight;
					const bobCFrame = fallenCframe.mul(new CFrame(0, bobOffset, 0));
					bubblePrimary.CFrame = bobCFrame;
					// bubble.PivotTo(bobCFrame);

					if (floatElapsed >= floatDuration) {
						// Previous render step is disconnected, so no, its not creating a new
						// renderstep connection every frame dw
						floatConnection.Disconnect();

						fallenCframe = bubble.GetPivot();

						// Now start attracting to player
						let attractElapsed = 0;
						const attractConnection = RunService.RenderStepped.Connect((dt2) => {
							startPivot = Players.LocalPlayer.Character?.GetPivot();
							if (!startPivot) {
								attractConnection.Disconnect();
								this.bubblePool.release(bubble);
								return;
							}

							attractElapsed += dt2;
							const alpha = math.clamp(attractElapsed / attractDuration, 0, 1);
							// bubble.PivotTo(fallenCframe.Lerp(startPivot, alpha));
							bubblePrimary.CFrame = fallenCframe.Lerp(startPivot, alpha);

							if (alpha >= 1) {
								attractConnection.Disconnect();
								this.bubblePool.release(bubble);
							}
						});
					}
				});
			});
		}
	}
}

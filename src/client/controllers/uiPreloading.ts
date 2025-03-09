import { Controller, OnStart } from "@flamework/core";
import { Players, ContentProvider, ReplicatedStorage } from "@rbxts/services";
import Sift from "@rbxts/sift";

@Controller()
export class PreloadingController implements OnStart {
	private player = Players.LocalPlayer;
	private ui = this.player.WaitForChild("PlayerGui") as PlayerGui;

	private preloaded: Record<string, boolean> = {};
	private activeClones: Record<string, ImageLabel | ImageButton> = {};
	private toClone: Array<string> = [];
	private preloadingUi: ScreenGui;
	private isPolling = false;

	private loaderThread: thread | undefined = undefined;

	constructor() {
		this.preloadingUi = new Instance("ScreenGui");
		this.preloadingUi.DisplayOrder = -1;
		this.preloadingUi.Name = "Preloading";
		this.preloadingUi.Parent = this.ui;
	}

	private enqueueClone(imageObject: ImageLabel | ImageButton): boolean {
		const imageUrl = imageObject.Image;
		if (
			imageUrl === "" ||
			this.preloaded[imageUrl] ||
			this.toClone.includes(imageUrl) ||
			this.activeClones[imageUrl] !== undefined
		) {
			return false;
		}
		this.toClone.push(imageUrl);
		return true;
	}

	private async pollIsLoaded() {
		if (this.isPolling) return;
		this.isPolling = true;

		while (Sift.Dictionary.count(this.activeClones) > 0) {
			const toRemove = [];

			for (const [imageUrl, imageObject] of pairs(this.activeClones)) {
				if (imageObject.IsLoaded) {
					this.preloaded[imageUrl] = true;
					toRemove.push(imageUrl);
					imageObject.Visible = false;
				}
			}

			const preloadedImages = ReplicatedStorage.GetAttribute("PreloadedImages") ?? 0;
			ReplicatedStorage.SetAttribute("PreloadedImages", (preloadedImages as number) + toRemove.size());
			for (const imageUrl of toRemove) {
				delete this.activeClones[imageUrl];
			}

			task.wait(0.1);
		}

		this.isPolling = false;
	}

	private loadImagesToRam() {
		if (this.toClone.size() > 0) {
			const imagesToProcess = this.toClone;
			this.toClone = [];

			ContentProvider.PreloadAsync(imagesToProcess, (imageUrl, success) => {
				if (this.preloaded[imageUrl] || this.activeClones[imageUrl] !== undefined) return;

				if (success !== Enum.AssetFetchStatus.Success) return;

				const maxPreloadedImages = (ReplicatedStorage.GetAttribute("MaxImagesToPreload") as number) ?? 0;
				ReplicatedStorage.SetAttribute("MaxImagesToPreload", maxPreloadedImages + 1);

				const clone = new Instance("ImageLabel");
				clone.Name = imageUrl;
				clone.Size = new UDim2(0, 1, 0, 1);
				clone.ImageTransparency = 0.99;
				clone.Transparency = 1;
				clone.Position = new UDim2(1, 0, 1, 0);
				clone.AnchorPoint = new Vector2(1, 1);
				clone.Visible = true;
				clone.Image = imageUrl;
				clone.Parent = this.preloadingUi;

				this.activeClones[imageUrl] = clone;
			});
		}

		this.pollIsLoaded().then(() => {
			if (
				this.toClone.size() > 0 ||
				this.isPolling ||
				this.loaderThread !== undefined ||
				Sift.Dictionary.count(this.activeClones) > 0
			)
				return;
			ReplicatedStorage.SetAttribute("PreloadingComplete", true);
		});
	}

	private queueLoad() {
		if (this.loaderThread !== undefined) {
			task.cancel(this.loaderThread);
			this.loaderThread = undefined;
		}

		this.loaderThread = task.delay(0.1, () => {
			this.loadImagesToRam();
			this.loaderThread = undefined;
		});
	}

	private preloadUiImages() {
		this.ui.GetDescendants().forEach((descendant) => {
			if (descendant.IsDescendantOf(this.preloadingUi)) return;
			if (descendant.IsA("ImageLabel") || descendant.IsA("ImageButton")) {
				if (this.enqueueClone(descendant)) {
					this.queueLoad();
					descendant.GetPropertyChangedSignal("Image").Connect(() => {
						if (this.enqueueClone(descendant)) {
							this.queueLoad();
						}
					});
				}
			}
		});

		this.ui.DescendantAdded.Connect((descendant) => {
			if (descendant.IsDescendantOf(this.preloadingUi)) return;
			if (descendant.IsA("ImageLabel") || descendant.IsA("ImageButton")) {
				if (this.enqueueClone(descendant)) {
					this.queueLoad();
					descendant.GetPropertyChangedSignal("Image").Connect(() => {
						if (this.enqueueClone(descendant)) {
							this.queueLoad();
						}
					});
				}
			}
		});
	}

	onStart() {
		ReplicatedStorage.SetAttribute("PreloadedImages", 0);
		this.preloadUiImages();
		this.queueLoad();
	}
}

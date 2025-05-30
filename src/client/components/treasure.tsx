//!optimize 2
import { Component, BaseComponent } from "@flamework/components";
import ReactRoblox from "@rbxts/react-roblox";
import { RichBillboardText } from "client/reactComponents/richBillboardText";
import React, { useEffect } from "@rbxts/react";
import { fullTargetConfig, trashConfig } from "shared/config/targetConfig";
import { shortenNumber } from "shared/util/nameUtil";
import { getMapFromTarget, getOneInXChance } from "shared/util/targetUtil";
import { gameConstants } from "shared/gameConstants";

interface Attributes {}

interface TreasureComponent extends Instance {}

@Component({
	tag: "Treasure",
})
export class Treasure extends BaseComponent<Attributes, TreasureComponent> {
	private root: ReactRoblox.Root | undefined;
	destroy(): void {
		this.root?.unmount();
		this.root = undefined;
	}

	constructor() {
		super();
		const name = this.instance.Name;
		const cfg = fullTargetConfig[name];
		if (!cfg) {
			error(`No config found for treasure with name ${name}`);
		}

		const container = new Instance("Folder");
		const root = ReactRoblox.createRoot(container);
		this.root = root;
		const Billboard: React.FC<{}> = (_) => {
			const [enabled, setEnabled] = React.useState(true);

			let adornee = undefined;

			useEffect(() => {
				if (this.instance.IsA("PVInstance")) {
					setEnabled(this.instance.GetAttribute("DiggingComplete") === true);

					this.instance.AttributeChanged.Connect((key) => {
						if (key === "DiggingComplete") {
							setEnabled(this.instance.GetAttribute("DiggingComplete") === true);
						}
					});
				}
			}, []);

			const chance = getOneInXChance(name, getMapFromTarget(name) ?? "Grasslands");

			const isTrash = trashConfig[name] !== undefined;
			const rarityColor = gameConstants.RARITY_COLORS[cfg.rarityType];
			const color = isTrash
				? `rgb(255,100,100)`
				: `rgb(${math.floor(rarityColor.R * 255)},${math.floor(rarityColor.G * 255)},${math.floor(
						rarityColor.B * 255,
				  )})`;

			return (
				<RichBillboardText
					text={`1 in <font color="${color}"><b>${shortenNumber(chance, false)}</b></font>`}
					adornee={this.instance as Model | Tool}
					isRichText={true}
					offsetWorldSpace={new Vector3(0, 1, 0)}
					font={Enum.Font.GothamMedium}
					bbgSize={new UDim2(4, 0, 1, 0)}
					enabled={(this.instance.IsA("Tool") && true) || (enabled && chance > 0)}
					strokeColor={gameConstants.RARITY_COLORS[cfg.rarityType]}
				/>
			);
		};

		root.render(ReactRoblox.createPortal(<Billboard />, this.instance));
	}
}

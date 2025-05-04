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
	constructor() {
		super();
		const name = this.instance.Name;
		const cfg = fullTargetConfig[name];
		if (!cfg) {
			error(`No config found for treasure with name ${name}`);
		}

		const container = new Instance("Folder");
		const root = ReactRoblox.createRoot(container);
		const Billboard: React.FC<{}> = (_) => {
			const [enabled, setEnabled] = React.useState(true);

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

			const adornee = this.instance.IsA("PVInstance")
				? this.instance
				: this.instance.FindFirstChildWhichIsA("PVInstance");

			if (!adornee) {
				error("No adornee found for treasure display.");
			}

			const chance = getOneInXChance(name, getMapFromTarget(name) ?? "Grasslands");

			const isTrash = trashConfig[name] !== undefined;
			const color = isTrash ? "rgb(255,100,100)" : "rgb(100,125,255)";

			return (
				<RichBillboardText
					text={`1 in <font color="${color}"><b>${shortenNumber(chance, false)}</b></font>`}
					adornee={adornee}
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

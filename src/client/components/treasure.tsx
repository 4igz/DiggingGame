import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import ReactRoblox from "@rbxts/react-roblox";
import { RichBillboardText } from "client/reactComponents/richBillboardText";
import React, { useEffect } from "@rbxts/react";
import { fullTargetConfig } from "shared/config/targetConfig";
import { shortenNumber } from "shared/util/nameUtil";
import { getMapFromTarget, getOneInXChance } from "shared/util/targetUtil";

interface Attributes {}

interface TreasureComponent extends Model {}

@Component({
	tag: "Treasure",
})
export class Treasure extends BaseComponent<Attributes, TreasureComponent> implements OnStart {
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
				if (this.instance.IsA("Model")) {
					setEnabled(this.instance.GetAttribute("DiggingComplete") === true);

					this.instance.AttributeChanged.Connect((key) => {
						if (key === "DiggingComplete") {
							setEnabled(this.instance.GetAttribute("DiggingComplete") === true);
						}
					});
				}
			}, []);

			return (
				<RichBillboardText
					text={`1 in <font color="rgb(100,125,255)"><b>${shortenNumber(
						getOneInXChance(name, getMapFromTarget(name) ?? "Grasslands"),
					)}</b></font>`}
					adornee={this.instance}
					isRichText={true}
					offsetWorldSpace={new Vector3(0, 1, 0)}
					font={Enum.Font.GothamMedium}
					bbgSize={new UDim2(4, 0, 1, 0)}
					enabled={enabled}
				/>
			);
		};

		root.render(ReactRoblox.createPortal(<Billboard />, this.instance));
	}

	onStart() {}
}

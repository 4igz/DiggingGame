import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import ReactRoblox from "@rbxts/react-roblox";
import { RichBillboardText } from "client/reactComponents/richBillboardText";
import React from "@rbxts/react";
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
		const gui = (
			<RichBillboardText
				text={`1 in <font color="rgb(100,125,255)"><b>${shortenNumber(
					getOneInXChance(name, getMapFromTarget(name) ?? "Grasslands"),
				)}</b></font>`}
				adornee={this.instance}
				isRichText={true}
				offsetWorldSpace={new Vector3(0, 1, 0)}
				font={Enum.Font.GothamMedium}
				bbgSize={new UDim2(4, 0, 1, 0)}
			/>
		);

		root.render(ReactRoblox.createPortal(gui, this.instance));
	}

	onStart() {}
}

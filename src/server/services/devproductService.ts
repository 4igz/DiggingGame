import { Service, OnStart } from "@flamework/core";
import { MarketplaceService, Players } from "@rbxts/services";
import { handlePurchase } from "shared/config/devproducts";

@Service({})
export class DevproductService implements OnStart {
	onStart() {
		MarketplaceService.ProcessReceipt = (receiptInfo) => {
			const player = Players.GetPlayerByUserId(receiptInfo.PlayerId);

			if (player) {
				return handlePurchase(player, receiptInfo.ProductId);
			}

			// If the player is not found, defer the processing
			return Enum.ProductPurchaseDecision.NotProcessedYet;
		};
	}
}

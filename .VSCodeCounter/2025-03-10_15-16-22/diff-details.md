# Diff Details

Date : 2025-03-10 15:16:22

Directory c:\\Users\\jorde\\OneDrive\\Documents\\GitHub\\DiggingGame\\src

Total : 124 files,  3331 codes, 263 comments, 521 blanks, all 4115 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [src/client/atoms/inventoryAtoms.ts](/src/client/atoms/inventoryAtoms.ts) | TypeScript | 0 | 1 | 0 | 1 |
| [src/client/atoms/uiAtoms.ts](/src/client/atoms/uiAtoms.ts) | TypeScript | 2 | 0 | 2 | 4 |
| [src/client/components/boat.ts](/src/client/components/boat.ts) | TypeScript | 43 | 10 | 9 | 62 |
| [src/client/components/treasure.tsx](/src/client/components/treasure.tsx) | TypeScript JSX | -1 | 1 | 1 | 1 |
| [src/client/controllers/autoDigController.ts](/src/client/controllers/autoDigController.ts) | TypeScript | 61 | 6 | 23 | 90 |
| [src/client/controllers/detectorController.ts](/src/client/controllers/detectorController.ts) | TypeScript | 71 | -3 | 18 | 86 |
| [src/client/controllers/gamepassController.ts](/src/client/controllers/gamepassController.ts) | TypeScript | 9 | -1 | 0 | 8 |
| [src/client/controllers/levelUpController.ts](/src/client/controllers/levelUpController.ts) | TypeScript | -1 | -1 | 0 | -2 |
| [src/client/controllers/promptController.ts](/src/client/controllers/promptController.ts) | TypeScript | 0 | 1 | 0 | 1 |
| [src/client/controllers/questController.ts](/src/client/controllers/questController.ts) | TypeScript | 223 | 3 | 26 | 252 |
| [src/client/controllers/selfReport.ts](/src/client/controllers/selfReport.ts) | TypeScript | 97 | 9 | 13 | 119 |
| [src/client/controllers/shopController.ts](/src/client/controllers/shopController.ts) | TypeScript | -12 | 1 | 3 | -8 |
| [src/client/controllers/shovelController.ts](/src/client/controllers/shovelController.ts) | TypeScript | 253 | 23 | 48 | 324 |
| [src/client/controllers/treasureAnimationController.ts](/src/client/controllers/treasureAnimationController.ts) | TypeScript | 9 | 1 | 1 | 11 |
| [src/client/controllers/uiController.ts](/src/client/controllers/uiController.ts) | TypeScript | 245 | 45 | 30 | 320 |
| [src/client/controllers/uiPreloading.ts](/src/client/controllers/uiPreloading.ts) | TypeScript | 142 | 3 | 28 | 173 |
| [src/client/controllers/zoneController.ts](/src/client/controllers/zoneController.ts) | TypeScript | 2 | 7 | 2 | 11 |
| [src/client/hooks/useMotion.ts](/src/client/hooks/useMotion.ts) | TypeScript | 0 | 1 | 0 | 1 |
| [src/client/hooks/usePx.ts](/src/client/hooks/usePx.ts) | TypeScript | 0 | 1 | 0 | 1 |
| [src/client/network.ts](/src/client/network.ts) | TypeScript | 0 | 1 | 0 | 1 |
| [src/client/reactComponents/boatShop.tsx](/src/client/reactComponents/boatShop.tsx) | TypeScript JSX | 327 | 8 | 18 | 353 |
| [src/client/reactComponents/boughtItemPopup.tsx](/src/client/reactComponents/boughtItemPopup.tsx) | TypeScript JSX | 0 | 1 | 0 | 1 |
| [src/client/reactComponents/canDigPopup.tsx](/src/client/reactComponents/canDigPopup.tsx) | TypeScript JSX | -33 | -1 | -8 | -42 |
| [src/client/reactComponents/clickEffect.tsx](/src/client/reactComponents/clickEffect.tsx) | TypeScript JSX | 121 | 0 | 20 | 141 |
| [src/client/reactComponents/dailyReward.tsx](/src/client/reactComponents/dailyReward.tsx) | TypeScript JSX | 0 | 1 | 0 | 1 |
| [src/client/reactComponents/detectorHint.tsx](/src/client/reactComponents/detectorHint.tsx) | TypeScript JSX | 43 | 0 | 6 | 49 |
| [src/client/reactComponents/dialogResponse.tsx](/src/client/reactComponents/dialogResponse.tsx) | TypeScript JSX | 176 | 1 | 15 | 192 |
| [src/client/reactComponents/diggingBar.tsx](/src/client/reactComponents/diggingBar.tsx) | TypeScript JSX | 34 | 1 | 6 | 41 |
| [src/client/reactComponents/gamepassShop.tsx](/src/client/reactComponents/gamepassShop.tsx) | TypeScript JSX | 2 | 1 | 0 | 3 |
| [src/client/reactComponents/inventory.tsx](/src/client/reactComponents/inventory.tsx) | TypeScript JSX | 2,679 | 129 | 188 | 2,996 |
| [src/client/reactComponents/isleEnterPopup.tsx](/src/client/reactComponents/isleEnterPopup.tsx) | TypeScript JSX | 65 | 1 | -1 | 65 |
| [src/client/reactComponents/itemAddedPopup.tsx](/src/client/reactComponents/itemAddedPopup.tsx) | TypeScript JSX | 0 | 1 | 0 | 1 |
| [src/client/reactComponents/itemViewport.tsx](/src/client/reactComponents/itemViewport.tsx) | TypeScript JSX | 0 | 1 | 0 | 1 |
| [src/client/reactComponents/luckBar.tsx](/src/client/reactComponents/luckBar.tsx) | TypeScript JSX | -7 | 1 | 0 | -6 |
| [src/client/reactComponents/mainUi.tsx](/src/client/reactComponents/mainUi.tsx) | TypeScript JSX | -2,486 | -96 | -167 | -2,749 |
| [src/client/reactComponents/playTimeRewards.tsx](/src/client/reactComponents/playTimeRewards.tsx) | TypeScript JSX | 171 | 5 | 14 | 190 |
| [src/client/reactComponents/popups.tsx](/src/client/reactComponents/popups.tsx) | TypeScript JSX | -1 | 1 | 0 | 0 |
| [src/client/reactComponents/questInfoSidebutton.tsx](/src/client/reactComponents/questInfoSidebutton.tsx) | TypeScript JSX | 120 | 1 | 15 | 136 |
| [src/client/reactComponents/richBillboardText.tsx](/src/client/reactComponents/richBillboardText.tsx) | TypeScript JSX | 0 | 1 | 0 | 1 |
| [src/client/reactComponents/rightSideMenu.tsx](/src/client/reactComponents/rightSideMenu.tsx) | TypeScript JSX | 46 | 1 | 7 | 54 |
| [src/client/reactComponents/sell.tsx](/src/client/reactComponents/sell.tsx) | TypeScript JSX | -110 | 17 | -16 | -109 |
| [src/client/reactComponents/shop.tsx](/src/client/reactComponents/shop.tsx) | TypeScript JSX | 112 | -39 | 15 | 88 |
| [src/client/reactComponents/sidebar.tsx](/src/client/reactComponents/sidebar.tsx) | TypeScript JSX | 52 | -1 | 4 | 55 |
| [src/client/reactComponents/soldItemPopup.tsx](/src/client/reactComponents/soldItemPopup.tsx) | TypeScript JSX | 1 | 1 | 0 | 2 |
| [src/client/reactComponents/targetCompass.tsx](/src/client/reactComponents/targetCompass.tsx) | TypeScript JSX | 0 | 1 | 0 | 1 |
| [src/client/reactComponents/toolbar.tsx](/src/client/reactComponents/toolbar.tsx) | TypeScript JSX | 15 | -27 | 1 | -11 |
| [src/client/reactComponents/typeWritingBillboard.tsx](/src/client/reactComponents/typeWritingBillboard.tsx) | TypeScript JSX | 1 | 1 | 0 | 2 |
| [src/client/reactComponents/volumeMuteButton.tsx](/src/client/reactComponents/volumeMuteButton.tsx) | TypeScript JSX | 0 | 1 | 0 | 1 |
| [src/client/runtime.client.ts](/src/client/runtime.client.ts) | TypeScript | 3 | 1 | -1 | 3 |
| [src/server/modules/serverSignals.ts](/src/server/modules/serverSignals.ts) | TypeScript | 5 | 0 | 2 | 7 |
| [src/server/profileTemplate.ts](/src/server/profileTemplate.ts) | TypeScript | 10 | 1 | 4 | 15 |
| [src/server/runtime.server.ts](/src/server/runtime.server.ts) | TypeScript | 3 | 0 | 0 | 3 |
| [src/server/services/analyticsService.ts](/src/server/services/analyticsService.ts) | TypeScript | -18 | -3 | -3 | -24 |
| [src/server/services/backend/analyticsService.ts](/src/server/services/backend/analyticsService.ts) | TypeScript | 18 | 3 | 3 | 24 |
| [src/server/services/backend/devproductService.ts](/src/server/services/backend/devproductService.ts) | TypeScript | 94 | 0 | 19 | 113 |
| [src/server/services/backend/gamepassService.ts](/src/server/services/backend/gamepassService.ts) | TypeScript | 68 | 6 | 15 | 89 |
| [src/server/services/backend/leaderstatService.ts](/src/server/services/backend/leaderstatService.ts) | TypeScript | 76 | 0 | 12 | 88 |
| [src/server/services/backend/moneyService.ts](/src/server/services/backend/moneyService.ts) | TypeScript | 45 | 3 | 10 | 58 |
| [src/server/services/backend/profileService.ts](/src/server/services/backend/profileService.ts) | TypeScript | 96 | 2 | 19 | 117 |
| [src/server/services/backend/security/banService.ts](/src/server/services/backend/security/banService.ts) | TypeScript | 24 | 0 | 3 | 27 |
| [src/server/services/backend/security/clientDetections.ts](/src/server/services/backend/security/clientDetections.ts) | TypeScript | 50 | 4 | 11 | 65 |
| [src/server/services/backend/security/renameRemotes.ts](/src/server/services/backend/security/renameRemotes.ts) | TypeScript | 18 | 22 | 2 | 42 |
| [src/server/services/backend/zoneService.ts](/src/server/services/backend/zoneService.ts) | TypeScript | 111 | 2 | 13 | 126 |
| [src/server/services/boatService.ts](/src/server/services/boatService.ts) | TypeScript | -175 | -8 | -30 | -213 |
| [src/server/services/detectorService.ts](/src/server/services/detectorService.ts) | TypeScript | -138 | -12 | -31 | -181 |
| [src/server/services/devproductService.ts](/src/server/services/devproductService.ts) | TypeScript | -90 | 0 | -18 | -108 |
| [src/server/services/gamepassService.ts](/src/server/services/gamepassService.ts) | TypeScript | -69 | -6 | -15 | -90 |
| [src/server/services/gameplay/boatService.ts](/src/server/services/gameplay/boatService.ts) | TypeScript | 234 | 11 | 50 | 295 |
| [src/server/services/gameplay/detectorService.ts](/src/server/services/gameplay/detectorService.ts) | TypeScript | 166 | 15 | 33 | 214 |
| [src/server/services/gameplay/inventoryService.ts](/src/server/services/gameplay/inventoryService.ts) | TypeScript | 457 | 8 | 91 | 556 |
| [src/server/services/gameplay/levelService.ts](/src/server/services/gameplay/levelService.ts) | TypeScript | 94 | 0 | 21 | 115 |
| [src/server/services/gameplay/questService.ts](/src/server/services/gameplay/questService.ts) | TypeScript | 206 | 7 | 32 | 245 |
| [src/server/services/gameplay/rewardsService.ts](/src/server/services/gameplay/rewardsService.ts) | TypeScript | 122 | 2 | 21 | 145 |
| [src/server/services/gameplay/targetService.ts](/src/server/services/gameplay/targetService.ts) | TypeScript | 511 | 129 | 130 | 770 |
| [src/server/services/inventoryService.ts](/src/server/services/inventoryService.ts) | TypeScript | -430 | -6 | -85 | -521 |
| [src/server/services/leaderstatService.ts](/src/server/services/leaderstatService.ts) | TypeScript | -38 | -1 | -6 | -45 |
| [src/server/services/levelService.ts](/src/server/services/levelService.ts) | TypeScript | -87 | 0 | -19 | -106 |
| [src/server/services/moneyService.ts](/src/server/services/moneyService.ts) | TypeScript | -42 | -3 | -8 | -53 |
| [src/server/services/profileService.ts](/src/server/services/profileService.ts) | TypeScript | -60 | -1 | -10 | -71 |
| [src/server/services/rewardsService.ts](/src/server/services/rewardsService.ts) | TypeScript | -127 | -2 | -20 | -149 |
| [src/server/services/shovelService.ts](/src/server/services/shovelService.ts) | TypeScript | -47 | 0 | -8 | -55 |
| [src/server/services/targetService.ts](/src/server/services/targetService.ts) | TypeScript | -566 | -91 | -134 | -791 |
| [src/server/services/zoneService.ts](/src/server/services/zoneService.ts) | TypeScript | -80 | -1 | -9 | -90 |
| [src/shared/config/boatConfig.ts](/src/shared/config/boatConfig.ts) | TypeScript | 0 | 1 | 0 | 1 |
| [src/shared/config/dailyRewardConfig.ts](/src/shared/config/dailyRewardConfig.ts) | TypeScript | 0 | 1 | 0 | 1 |
| [src/shared/config/devproducts.ts](/src/shared/config/devproducts.ts) | TypeScript | 7 | 1 | 0 | 8 |
| [src/shared/config/mapConfig.d.ts](/src/shared/config/mapConfig.d.ts) | TypeScript | 1 | 0 | 0 | 1 |
| [src/shared/config/mapConfig.lua](/src/shared/config/mapConfig.lua) | Luau | 3 | 2 | 0 | 5 |
| [src/shared/config/metalDetectorConfig.lua](/src/shared/config/metalDetectorConfig.lua) | Luau | 9 | 0 | 0 | 9 |
| [src/shared/config/npcAnimationConfig.luau](/src/shared/config/npcAnimationConfig.luau) | Luau | 0 | 0 | 2 | 2 |
| [src/shared/config/potionConfig.ts](/src/shared/config/potionConfig.ts) | TypeScript | 0 | 1 | 0 | 1 |
| [src/shared/config/questConfig.d.ts](/src/shared/config/questConfig.d.ts) | TypeScript | 24 | 0 | 12 | 36 |
| [src/shared/config/questConfig.luau](/src/shared/config/questConfig.luau) | Luau | 150 | 4 | 36 | 190 |
| [src/shared/config/shopConfig.ts](/src/shared/config/shopConfig.ts) | TypeScript | 0 | 1 | 0 | 1 |
| [src/shared/config/targetConfig.lua](/src/shared/config/targetConfig.lua) | Luau | -365 | -6 | -4 | -375 |
| [src/shared/config/targetConfig.luau](/src/shared/config/targetConfig.luau) | Luau | 365 | 6 | 18 | 389 |
| [src/shared/config/timePlayedConfig.ts](/src/shared/config/timePlayedConfig.ts) | TypeScript | 0 | 1 | 0 | 1 |
| [src/shared/constants.d.ts](/src/shared/constants.d.ts) | TypeScript | -61 | -1 | -18 | -80 |
| [src/shared/constants.lua](/src/shared/constants.lua) | Luau | -118 | -5 | -14 | -137 |
| [src/shared/gameConstants.d.ts](/src/shared/gameConstants.d.ts) | TypeScript | 71 | 1 | 20 | 92 |
| [src/shared/gameConstants.lua](/src/shared/gameConstants.lua) | Luau | 129 | 10 | 17 | 156 |
| [src/shared/network.ts](/src/shared/network.ts) | TypeScript | 19 | 1 | 2 | 22 |
| [src/shared/networkTypes.ts](/src/shared/networkTypes.ts) | TypeScript | 18 | 0 | 3 | 21 |
| [src/shared/signals.ts](/src/shared/signals.ts) | TypeScript | 6 | 1 | 0 | 7 |
| [src/shared/util/attributeUtil.ts](/src/shared/util/attributeUtil.ts) | TypeScript | 0 | 1 | 0 | 1 |
| [src/shared/util/castingUtil.ts](/src/shared/util/castingUtil.ts) | TypeScript | 8 | 2 | 1 | 11 |
| [src/shared/util/characterUtil.ts](/src/shared/util/characterUtil.ts) | TypeScript | 0 | 2 | -1 | 1 |
| [src/shared/util/colorUtil.ts](/src/shared/util/colorUtil.ts) | TypeScript | 27 | 0 | 6 | 33 |
| [src/shared/util/crossPlatformUtil.ts](/src/shared/util/crossPlatformUtil.ts) | TypeScript | 0 | 1 | 0 | 1 |
| [src/shared/util/detectorUtil.ts](/src/shared/util/detectorUtil.ts) | TypeScript | 2 | 2 | 0 | 4 |
| [src/shared/util/eternityNum.d.ts](/src/shared/util/eternityNum.d.ts) | TypeScript | 0 | 2 | 0 | 2 |
| [src/shared/util/eternityNum.lua](/src/shared/util/eternityNum.lua) | Luau | 0 | 2 | 0 | 2 |
| [src/shared/util/interval.luau](/src/shared/util/interval.luau) | Luau | 0 | 2 | 0 | 2 |
| [src/shared/util/logUtil.ts](/src/shared/util/logUtil.ts) | TypeScript | 6 | 0 | 2 | 8 |
| [src/shared/util/monetizationUtil.ts](/src/shared/util/monetizationUtil.ts) | TypeScript | -1 | 1 | 0 | 0 |
| [src/shared/util/nameUtil.ts](/src/shared/util/nameUtil.ts) | TypeScript | 22 | 14 | 6 | 42 |
| [src/shared/util/objectPool.ts](/src/shared/util/objectPool.ts) | TypeScript | 24 | 0 | 5 | 29 |
| [src/shared/util/pather.ts](/src/shared/util/pather.ts) | TypeScript | 24 | 0 | 3 | 27 |
| [src/shared/util/playerUtil.ts](/src/shared/util/playerUtil.ts) | TypeScript | 7 | 10 | 4 | 21 |
| [src/shared/util/rarityUtil.ts](/src/shared/util/rarityUtil.ts) | TypeScript | 20 | 1 | 2 | 23 |
| [src/shared/util/symbol.lua](/src/shared/util/symbol.lua) | Luau | 9 | 2 | 2 | 13 |
| [src/shared/util/tagUtil.ts](/src/shared/util/tagUtil.ts) | TypeScript | 10 | 0 | 2 | 12 |
| [src/shared/util/targetUtil.ts](/src/shared/util/targetUtil.ts) | TypeScript | 0 | -2 | 0 | -2 |
| [src/shared/util/vfxUtil.ts](/src/shared/util/vfxUtil.ts) | TypeScript | 0 | 1 | 0 | 1 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details
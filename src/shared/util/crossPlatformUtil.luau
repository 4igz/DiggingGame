local UserInputService = game:GetService("UserInputService")

local function getPlayerPlatform()
	if UserInputService.TouchEnabled and not UserInputService.MouseEnabled then
		return "Mobile"
	elseif
		UserInputService.GamepadEnabled
		and not UserInputService.KeyboardEnabled
		and not UserInputService.MouseEnabled
	then
		return "Console"
	elseif UserInputService.KeyboardEnabled or UserInputService.MouseEnabled then
		return "PC"
	else
		return "Unknown"
	end
end

return {
	getPlayerPlatform = getPlayerPlatform,
}

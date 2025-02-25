--!optimize 2
--!native
local function createSymbol(name)
	local proxy = newproxy(true)
	local meta = getmetatable(proxy)
	meta.__tostring = function()
		return string.format("Symbol(%s)", name)
	end
	return proxy
end

return createSymbol

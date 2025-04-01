--!optimize 2
--!native
local function interval(s, cleanupInterval)
	local pins = {} -- stores the last execution time for each ID
	local lastCleanup = os.clock()
	cleanupInterval = cleanupInterval or s * 10

	local function throttle(id: any?)
		id = id or 0

		if os.clock() - lastCleanup > cleanupInterval then
			for key, lastTime in pins do
				-- Remove IDs that have not been used for a long time
				if os.clock() - lastTime > cleanupInterval then
					pins[key] = nil
				end
			end
			lastCleanup = os.clock()
		end

		if not pins[id] then
			pins[id] = 0
		end

		local elapsed = os.clock() - pins[id] > s
		if elapsed then
			pins[id] = os.clock()
		end

		return elapsed
	end

	return throttle
end

return { interval = interval }

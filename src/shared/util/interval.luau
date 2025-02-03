local function interval(s, cleanupInterval)
	local pins = {} -- Table to store last execution time for each ID
	local lastCleanup = os.clock() -- Tracks the last time cleanup was run
	cleanupInterval = cleanupInterval or s * 10 -- Default cleanup interval is 10x the throttle interval

	local function throttle(id: any?)
		-- Ensure the ID is specified
		id = id or 0

		-- Perform cleanup if necessary
		if os.clock() - lastCleanup > cleanupInterval then
			for key, lastTime in pins do
				-- Remove IDs that have not been used for a long time
				if os.clock() - lastTime > cleanupInterval then
					pins[key] = nil
				end
			end
			lastCleanup = os.clock()
		end

		-- Update the throttle logic
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

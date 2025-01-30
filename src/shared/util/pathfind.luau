local PathfindingService = game:GetService("PathfindingService")
local RunService = game:GetService("RunService")

local Trove = require(game:GetService("ReplicatedStorage")["rbxts_include"]["node_modules"]["@rbxts"].trove.out).Trove

local function pathfind(position, pathfindCharacter, agentParameters)
	local humanoid: Humanoid = pathfindCharacter:FindFirstChild("Humanoid")

	if not humanoid then
		warn("Pathfind character has no humanoid")
		return
	end

	local trove = Trove.new()

	local path = PathfindingService:CreatePath(agentParameters)

	local lastTargetPosition = nil
	local currentWaypointIndex = 0
	local waypoints = {}

	local randomJumpCooldown = math.random(1, 3)
	local lastJumpTime = 0

	local function moveToTarget(predictedPosition)
		humanoid:MoveTo(predictedPosition)

		-- This is generally used if they get stuck somewhere
		if (tick() - lastJumpTime) >= randomJumpCooldown then
			humanoid.Jump = true
			lastJumpTime = tick()
			randomJumpCooldown = math.random(1, 3)
		end
	end

	local function computePath(predictedPosition)
		local success, errorMessage = pcall(function()
			path:ComputeAsync(pathfindCharacter.PrimaryPart.Position, predictedPosition)
		end)

		if success and path.Status == Enum.PathStatus.Success then
			waypoints = path:GetWaypoints()
			currentWaypointIndex = #waypoints >= 3 and 3 or #waypoints
			return true
		elseif path.Status == Enum.PathStatus.NoPath then
			moveToTarget(predictedPosition)
			return false
		else
			warn("Pathfinding error: " .. errorMessage)
			return false
		end
	end

	local function handleWaypoints(predictedPosition)
		local MIN_WAYPOINT_DISTANCE = 5

		if #waypoints > 0 and currentWaypointIndex <= #waypoints then
			local waypoint = waypoints[currentWaypointIndex]
			if not pathfindCharacter.PrimaryPart then
				return
			end
			local distanceToWaypoint = (pathfindCharacter.PrimaryPart.Position - waypoint.Position).Magnitude

			if distanceToWaypoint < MIN_WAYPOINT_DISTANCE and currentWaypointIndex < #waypoints then
				currentWaypointIndex += 1
			end

			humanoid:MoveTo(waypoints[currentWaypointIndex].Position)
			if waypoint.Action == Enum.PathWaypointAction.Jump then
				humanoid.Jump = true
			end
		else
			moveToTarget(predictedPosition)
		end
	end

	local function onMoveToFinished(reached)
		if currentWaypointIndex > 0 and currentWaypointIndex < #waypoints then
			currentWaypointIndex += 1
			humanoid:MoveTo(waypoints[currentWaypointIndex].Position)
		elseif lastTargetPosition then
			humanoid:MoveTo(lastTargetPosition)
		end
	end

	computePath(position)

	trove:add(RunService.Stepped:Connect(function()
		if not pathfindCharacter or not pathfindCharacter.Parent then
			trove:destroy()
			return
		end
		computePath(position)
		handleWaypoints(position)
	end))

	trove:add(humanoid.MoveToFinished:Connect(onMoveToFinished))

	return trove
end

return { pathfind = pathfind }

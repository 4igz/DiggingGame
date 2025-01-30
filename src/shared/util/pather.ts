import Signal from "@rbxts/goodsignal";
import { Workspace, PathfindingService, Players, CollectionService } from "@rbxts/services";
import { findPlayerHumanoid } from "./playerUtil";
import { getCollidableExtentsSize } from "./characterUtil";
import { last } from "@rbxts/sift/out/Array";
import { gameConstants } from "shared/constants";

const raycastParams = new RaycastParams();
raycastParams.FilterType = Enum.RaycastFilterType.Exclude;

const player = Players.LocalPlayer;

export class Pather {
	private cancelled = false;
	private started = false;
	private pathComputing = false;
	private pathComputed = false;

	private humanoid?: Humanoid;
	private pathResult?: Path;

	private targetPoint: Vector3;
	private originPoint?: Vector3;
	private agentCanFollowPath = false;

	// Connections that we might need to disconnect upon cleanup:
	private diedConn?: RBXScriptConnection;
	private seatedConn?: RBXScriptConnection;
	private teleportedConn?: RBXScriptConnection;
	private blockedConn?: RBXScriptConnection;

	// Our path's list of waypoints, plus an index of which waypoint we're on
	private pointList: PathWaypoint[] = [];
	private currentWaypointIndex = 0;
	private recomputing = false;

	// Exposed signals that consumers can listen to
	public Finished = new Signal();
	public PathFailed = new Signal();

	constructor(endPoint: Vector3) {
		this.targetPoint = endPoint;

		// Attempt to find the local player's Humanoid & RootPart
		const localHumanoid = findPlayerHumanoid(player);
		if (!localHumanoid || !localHumanoid.RootPart) {
			warn("Pather: Could not find a valid Humanoid or RootPart for the local player.");
			return;
		}
		this.humanoid = localHumanoid;
		this.originPoint = localHumanoid.RootPart.Position;

		// Compute the agent size from the player's character
		const character = player.Character;
		if (!character) {
			warn("Pather: Could not find a character for the local player.");
			return;
		}
		const extents = getCollidableExtentsSize(character);
		if (!extents) {
			warn("Pather: Could not determine the character's collidable extents.");
			return;
		}

		const agentCanJump = true;
		this.agentCanFollowPath = true;

		// Create the Path object
		this.pathResult = PathfindingService.CreatePath({
			AgentRadius: 2.25, //agentRadius,
			AgentHeight: 5, //agentHeight,
			AgentCanJump: agentCanJump,
			AgentCanClimb: true,
			Costs: {
				PFAvoid: 20,
				Water: 20,
			},
		});

		// Compute the path right away (optional; you could do this lazily)
		this.computePath();
	}

	/**
	 * Compute or re-compute the path using PathfindingService.
	 */
	private computePath() {
		if (!this.humanoid || !this.pathResult || !this.originPoint) {
			return;
		}
		if (this.pathComputed || this.pathComputing) {
			return;
		}

		this.pathComputing = true;
		this.pathResult.ComputeAsync(this.originPoint, this.targetPoint);
		this.pointList = this.pathResult.GetWaypoints();
		this.pathComputed = this.pathResult.Status === Enum.PathStatus.Success;
		this.pathComputing = false;

		// Listen for path blocked if we got a valid path
		if (this.pathComputed) {
			this.blockedConn = this.pathResult.Blocked.Connect((blockedWaypointIdx) => {
				this.onPathBlocked(blockedWaypointIdx);
			});
		}
	}

	/**
	 * Called when the path is found to be blocked at or after some waypoint index.
	 */
	private onPathBlocked(blockedWaypointIdx: number) {
		if (this.recomputing) {
			return;
		}

		// If the blocked waypoint is beyond where we currently are, try re-pathing
		if (blockedWaypointIdx >= this.currentWaypointIndex) {
			this.recomputing = true;

			// Recompute from current position
			const rootPart = this.humanoid?.RootPart;
			if (rootPart) {
				this.originPoint = rootPart.Position;
			} else {
				this.originPoint = undefined;
			}

			if (this.pathResult && this.originPoint) {
				this.pathResult.ComputeAsync(this.originPoint, this.targetPoint);
				this.pointList = this.pathResult.GetWaypoints();
				this.pathComputed = this.pathResult.Status === Enum.PathStatus.Success;
			}

			if (!this.pathComputed) {
				this.PathFailed.Fire();
				this.Destroy();
				this.recomputing = false;
				return;
			}

			// If valid, start again from (say) waypoint index 1
			this.currentWaypointIndex = 1;
			this.moveToNextWaypoint();
			this.recomputing = false;
		}
	}

	/**
	 * Cleans up any existing connections and stops pathing.
	 */
	public Destroy() {
		CollectionService.GetTagged("PathfindingWaypoint").forEach((part) => part.Destroy());

		this.started = false;
		this.cancelled = true;
		this.pointList = [];

		this.pathResult?.Destroy();
		this.blockedConn?.Disconnect();
		this.diedConn?.Disconnect();
		this.seatedConn?.Disconnect();
		this.teleportedConn?.Disconnect();
	}

	/**
	 * Immediately cancel the path.
	 */
	public cancel() {
		this.cancelled = true;
		this.Destroy();
	}

	/**
	 * Is this path currently started and active?
	 */
	public isActive(): boolean {
		return this.agentCanFollowPath && this.started && !this.cancelled;
	}

	/**
	 * Convenience check to see if the path is valid (i.e., successful).
	 */
	public isValidPath(): boolean {
		this.computePath();
		return this.pathComputed && this.agentCanFollowPath;
	}

	/**
	 * Called if the path is interrupted by some external event
	 * (like dying, being seated, or teleported).
	 */
	private onPathInterrupted() {
		this.cancelled = true;
		this.PathFailed.Fire();
		this.Destroy();
	}

	/**
	 * Begin following the path. If no valid path, fires PathFailed.
	 */
	public start() {
		if (!this.agentCanFollowPath) {
			this.PathFailed.Fire();
			return;
		}
		if (this.started) {
			return;
		}
		this.started = true;

		// Start a loop to check if the player gets stuck
		task.spawn(() => {
			while (this.isActive()) {
				const currentWaypoint = this.currentWaypointIndex;
				task.wait(1);
				if (
					this.isActive() &&
					this.currentWaypointIndex === currentWaypoint &&
					this.humanoid?.FloorMaterial !== Enum.Material.Air
				) {
					// Player is stuck at the same waypoint for more than 2 seconds
					// Let's force a jump to try to get them unstuck
					this.humanoid?.ChangeState(Enum.HumanoidStateType.Jumping);
				}
			}
		});

		// If we have at least 2 waypoints, let's begin moving
		if (this.pointList.size() > 1 && this.humanoid && this.humanoid.RootPart) {
			// Connect events for interruption
			this.seatedConn = this.humanoid.Seated.Connect(() => this.onPathInterrupted());
			this.diedConn = this.humanoid.Died.Connect(() => this.onPathInterrupted());
			this.teleportedConn = this.humanoid.RootPart.GetPropertyChangedSignal("CFrame").Connect(() =>
				this.onPathInterrupted(),
			);

			// Typically, index 0 is the start position; index 1 is the first real destination
			this.currentWaypointIndex = 1;
			this.moveToNextWaypoint();
		} else {
			this.PathFailed.Fire();
		}
	}

	/**
	 * Tells the humanoid to MoveTo the next waypoint in the list.
	 */
	private moveToNextWaypoint() {
		// If we've canceled or aren't active, do nothing
		if (!this.isActive()) {
			return;
		}
		const playerPosition = this.humanoid!.RootPart!.Position;

		// If we've passed the last waypoint, we're done
		if (
			this.currentWaypointIndex >= this.pointList.size() ||
			playerPosition.sub(this.targetPoint).Magnitude <= gameConstants.DIG_RANGE
		) {
			this.Finished.Fire();
			this.Destroy();
			return;
		}

		const waypoint = this.pointList[this.currentWaypointIndex];

		// Check if the humanoid is on the ground before jumping, because changing the state to jumping while mid-air can cause them to double jump.
		if (waypoint.Action === Enum.PathWaypointAction.Jump && this.humanoid?.FloorMaterial !== Enum.Material.Air) {
			// Changing a state to jump is a bit of a hack to get the humanoid to jump
			// Using MoveTo overrides jumping, so we have to do this
			this.humanoid!.ChangeState(Enum.HumanoidStateType.Jumping);
		}

		// Calculate the direction to the next waypoint
		// Now MoveTo the waypoint
		this.humanoid!.MoveTo(waypoint.Position);

		// Listen for the move to finish
		const moveConn = this.humanoid!.MoveToFinished.Connect((reached) => {
			moveConn.Disconnect();

			// If we've been canceled or something, abort
			if (!this.isActive()) {
				return;
			}

			// If we've passed the last waypoint, we're done
			if (
				this.currentWaypointIndex >= this.pointList.size() ||
				playerPosition.sub(this.targetPoint).Magnitude <= gameConstants.DIG_RANGE
			) {
				this.Finished.Fire();
				this.Destroy();
				return;
			}

			if (reached) {
				// Successfully got to this waypoint; move to the next
				this.currentWaypointIndex++;
				this.moveToNextWaypoint();
			} else {
				// We failed to reach it, so path fails
				this.PathFailed.Fire();
				this.Destroy();
			}
		});
	}
}

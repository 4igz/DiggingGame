import { config, SpringOptions } from "@rbxts/ripple";

export const springs = {
	...config.spring,
	bubbly: { tension: 300, friction: 20, mass: 1.2 },
	responsive: { tension: 600, friction: 34, mass: 0.7 },
	fast: { tension: 800, friction: 80, mass: 0.5 }, // Adjusted friction to prevent overshoot or bounce
	crawl: { tension: 280, friction: 560 },
	walk: { tension: 5, friction: 5 },
	pitch: { tension: 5, friction: 5, mass: 10 }, // (also known as bitumen or asphalt)
	heavy: { tension: 125, friction: 84, mass: 45 },
} satisfies { [config: string]: SpringOptions };

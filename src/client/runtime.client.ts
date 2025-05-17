//!optimize 2
import { Flamework } from "@flamework/core";
import { debugWarn } from "shared/util/logUtil";

debugWarn("Client runtime loading modules.", "INIT", true);
Flamework.addPaths("src/client/components");
Flamework.addPaths("src/client/controllers");
Flamework.addPaths("src/shared/components");

debugWarn("Client modules loaded, igniting module init.", "INIT", true);
Flamework.ignite();

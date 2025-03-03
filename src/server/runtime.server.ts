import { Flamework } from "@flamework/core";
import { debugWarn } from "shared/util/logUtil";

debugWarn("Server runtime loading modules.");
Flamework.addPaths("src/server/components");
Flamework.addPaths("src/server/services");
Flamework.addPaths("src/shared/components");

debugWarn("Server runtime loading complete, igniting module init.");
Flamework.ignite();

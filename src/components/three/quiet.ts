import * as THREE from "three";

// R3F 9 still creates a THREE.Clock internally, which three r183+ flags as
// deprecated on every mount. Our scenes use THREE.Timer, so mute just that notice.
THREE.setConsoleFunction((type, message, ...params) => {
  if (type === "warn" && message.startsWith("THREE.Clock:")) return;
  console[type as "log" | "warn" | "error"](message, ...params);
});

import { isTauriApp } from "@/lib/navigator";

//
if (isTauriApp()) {
  console.log("✅ tauri app");
} else {
  console.log("✅ not tauri app");
}

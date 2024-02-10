import { LoginType } from "@/lib/schema/schema";
import "little-state-machine";

declare module "little-state-machine" {
  interface GlobalState {
    login: LoginType;
  }
}

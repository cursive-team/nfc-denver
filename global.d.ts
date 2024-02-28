import { LoginType } from "@/lib/schema/schema";
import { ProfileDisplayState } from "@/types";
import "little-state-machine";

/*
We use little-state-machine as a global state management library to store and share the user information across different pages and sections.
In particular, we are using it for collecting different user information for login/registration.
In this way, we can also have single file for the different steps of the login/registration process and simplify the code.
*/
declare module "little-state-machine" {
  interface GlobalState {
    login: LoginType;
    profile: ProfileType;
    profileView: ProfileDisplayState;
  }
}

declare global {
  interface Window {
    render: () => void;
    signatures: Array<{ pubKey: string; timestamp: number }>;
    artworkHeight: number;
    artworkWidth: number;
    params: any;
    myPubKey: string;
    stamp: any;
  }
}

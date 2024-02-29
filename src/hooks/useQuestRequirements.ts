import {
  getUsers,
  getLocationSignatures,
  LocationSignature,
  User,
} from "@/lib/client/localStorage";
import { QuestWithCompletion, QuestWithRequirements } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { computeNumRequirementsSatisfied } from "@/lib/client/quests";

export function useQuestRequirements(quests: QuestWithCompletion[]) {
  // Compute users and locations that user has signatures for
  const [userPublicKeys, setUserPublicKeys] = useState<string[]>([]);
  const [locationPublicKeys, setLocationPublicKeys] = useState<string[]>([]);

  // compute outbound taps
  const [userOutboundTaps, setUserOutboundTaps] = useState<number>(0);

  useEffect(() => {
    const users = getUsers();
    setUserOutboundTaps(
      Object.values(users).filter((user: User) => user.outTs).length
    );
    const locationSignatures = getLocationSignatures();

    const validUserPublicKeys = Object.values(users)
      .filter((user: User) => user.sig)
      .map((user: User) => user.sigPk!);
    setUserPublicKeys(validUserPublicKeys);

    const validLocationPublicKeys = Object.values(locationSignatures).map(
      (location: LocationSignature) => location.pk
    );
    setLocationPublicKeys(validLocationPublicKeys);
  }, []);

  const numRequirementsSatisfied: number[] = useMemo(() => {
    return (quests ?? [])?.map(
      ({
        userTapReq,
        userRequirements,
        locationRequirements,
      }: QuestWithRequirements) => {
        return computeNumRequirementsSatisfied({
          userPublicKeys,
          locationPublicKeys,
          userOutboundTaps,
          userRequirements,
          locationRequirements,
          questUserTapReq: userTapReq,
        });
      }
    );
  }, [quests, userPublicKeys, locationPublicKeys, userOutboundTaps]);

  return {
    numRequirementsSatisfied,
  };
}

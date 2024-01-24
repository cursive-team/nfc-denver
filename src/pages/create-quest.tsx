import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Input } from "@/components/Input";
import { useState } from "react";
import { Button } from "@/components/Button";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { getAuthToken } from "@/lib/client/localStorage";
import router from "next/router";

enum DisplayState {
  GENERAL,
  USER_REQ,
  LOCATION_REQ,
}

export default function CreateQuest() {
  const [displayState, setDisplayState] = useState<DisplayState>(
    DisplayState.GENERAL
  );
  const [questName, setQuestName] = useState<string>("");
  const [questDescription, setQuestDescription] = useState<string>("");
  const [buidlReward, setBuidlReward] = useState<number>(0);
  const [userReqs, setUserReqs] = useState<string>("");
  const [userPartialReqs, setUserPartialReqs] = useState<string>("");
  const [userPartialCt, setUserPartialCt] = useState(0);
  const [locationReqs, setLocationReqs] = useState<string>("");
  const [locationPartialReqs, setLocationPartialReqs] = useState<string>("");
  const [locationPartialCt, setLocationPartialCt] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);

  const handleQuestCreation = async (event: React.FormEvent) => {
    event.preventDefault();

    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      alert("You must be logged in to connect");
      router.push("/login");
      return;
    }

    setLoading(true);
    fetch("/api/quest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: authToken.value,
        name: questName,
        description: questDescription,
        buidlReward,
        userReqChipIds: userReqs.split(",").map((id) => parseInt(id)),
        userPartialReqChipIds: userPartialReqs
          .split(",")
          .map((id) => parseInt(id)),
        userPartialCt,
        locationReqChipIds: locationReqs.split(",").map((id) => parseInt(id)),
        locationPartialReqChipIds: locationPartialReqs
          .split(",")
          .map((id) => parseInt(id)),
        locationPartialCt,
      }),
    })
      .then((response) => {
        if (response.ok) {
          router.push("/social");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(error.message);
        setLoading(false);
      });
  };

  const handleUserReqSubmit = async (event: React.FormEvent) => {
    setDisplayState(DisplayState.GENERAL);
  };

  const handleLocationReqSubmit = async (event: React.FormEvent) => {
    setDisplayState(DisplayState.LOCATION_REQ);
  };

  return (
    <>
      {displayState === DisplayState.GENERAL && (
        <FormStepLayout
          title="Create quest"
          description=""
          onSubmit={handleQuestCreation}
        >
          <Input
            label="Name"
            placeholder="Name of quest"
            type="text"
            name="questName"
            value={questName}
            onChange={(event) => setQuestName(event.target.value)}
            required
          />
          <Input
            label="Description"
            placeholder="Description of quest"
            type="text"
            name="questDescription"
            value={questDescription}
            onChange={(event) => setQuestDescription(event.target.value)}
            required
          />
          <Input
            label="Buidl Reward"
            placeholder="Reward for quest"
            type="number"
            name="buidlReward"
            value={buidlReward}
            onChange={(event) => setBuidlReward(parseInt(event.target.value))}
            required
          />
          <Button
            onClick={() => setDisplayState(DisplayState.USER_REQ)}
            size="md"
            align="left"
          >
            <span>Set user requirements</span>
            <div className="ml-auto">
              <Icons.arrowRight />
            </div>
          </Button>
          <Button
            onClick={() => setDisplayState(DisplayState.LOCATION_REQ)}
            size="md"
            align="left"
          >
            <span>Set location requirements</span>
            <div className="ml-auto">
              <Icons.arrowRight />
            </div>
          </Button>
          <div className="flex flex-col gap-4">
            <Button loading={loading} type="submit">
              Submit
            </Button>{" "}
            <Link href="/social" className="link text-center">
              Cancel
            </Link>
          </div>
        </FormStepLayout>
      )}
      {displayState === DisplayState.USER_REQ && (
        <FormStepLayout
          title="Quest user requirements"
          description="Select users that must be met"
          onSubmit={handleUserReqSubmit}
        >
          <Input
            label="Requirements"
            placeholder="Enter user chipIds, comma separated"
            type="text"
            name="userReq"
            value={userReqs}
            onChange={(event) => setUserReqs(event.target.value)}
            required
          />
          <Input
            label="Partial requirements"
            placeholder="Enter user chipIds, comma separated"
            type="text"
            name="partialUserReq"
            value={userPartialReqs}
            onChange={(event) => setUserPartialReqs(event.target.value)}
          />
          {userPartialReqs.length > 1 && (
            <Input
              label="Partial Requirement Count"
              placeholder="Enter count"
              type="number"
              name="partialUserReqCount"
              value={userPartialCt}
              onChange={(event) =>
                setUserPartialCt(parseInt(event.target.value))
              }
              required
            />
          )}
          <div className="flex flex-col gap-4">
            <Button loading={loading} type="submit">
              Confirm
            </Button>
            <span
              onClick={() => setDisplayState(DisplayState.GENERAL)}
              className="link text-center"
            >
              Back
            </span>
          </div>
        </FormStepLayout>
      )}
      {displayState === DisplayState.LOCATION_REQ && (
        <FormStepLayout
          title="Quest location requirements"
          description="Select locations that must be visited"
          onSubmit={handleLocationReqSubmit}
        >
          <Input
            label="Requirements"
            placeholder="Enter locations chipIds, comma separated"
            type="text"
            name="locationReqs"
            value={locationReqs}
            onChange={(event) => setLocationReqs(event.target.value)}
            required
          />
          <Input
            label="Partial requirements"
            placeholder="Enter locations chipIds, comma separated"
            type="text"
            name="locationPartialReqs"
            value={locationPartialReqs}
            onChange={(event) => setLocationPartialReqs(event.target.value)}
          />
          {locationPartialReqs.length > 0 && (
            <Input
              label="Partial requirement count"
              placeholder="How many partial requirements are needed?"
              type="number"
              name="partialUserReqCount"
              value={locationPartialCt}
              onChange={(event) =>
                setLocationPartialCt(parseInt(event.target.value))
              }
              required
            />
          )}
          <div className="flex flex-col gap-4">
            <Button loading={loading} type="submit">
              Confirm
            </Button>
            <span
              onClick={() => setDisplayState(DisplayState.GENERAL)}
              className="link text-center"
            >
              Back
            </span>
          </div>
        </FormStepLayout>
      )}
    </>
  );
}

CreateQuest.getInitialProps = () => {
  return { showFooter: false, showHeader: true };
};

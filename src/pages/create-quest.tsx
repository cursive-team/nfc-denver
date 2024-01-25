import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Input } from "@/components/Input";
import { useState } from "react";
import { Button } from "@/components/Button";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { getAuthToken } from "@/lib/client/localStorage";
import router from "next/router";

enum DisplayState {
  CREATE_QUEST_FORM,
  ADD_REQUIREMENT,
}

type QuestRequirement = {
  name: string;
  type: "USER" | "LOCATION";
  ids: string[];
  numSigsRequired: number;
};
export default function CreateQuest() {
  const [displayState, setDisplayState] = useState<DisplayState>(
    DisplayState.CREATE_QUEST_FORM
  );
  const [questName, setQuestName] = useState<string>("");
  const [questDescription, setQuestDescription] = useState<string>("");
  const [buidlReward, setBuidlReward] = useState<number>(0);
  const [questReqs, setQuestReqs] = useState<QuestRequirement[]>([]);
  const [tempQuestReq, setTempQuestReq] = useState<QuestRequirement>();
  const [loading, setLoading] = useState<boolean>(false);

  const handleQuestCreation = async (event: React.FormEvent) => {
    event.preventDefault();

    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      alert("You must be logged in to connect");
      router.push("/login");
      return;
    }

    if (questReqs.length === 0) {
      alert("You must have at least one requirement");
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
        requirements: questReqs,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      })
      .then((data) => {
        setLoading(false);
        router.push(`/quests/${data.id}`);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(error.message);
        setLoading(false);
      });
  };

  const handleAddRequirement = () => {
    setTempQuestReq({
      name: "",
      type: "USER",
      ids: [],
      numSigsRequired: 1,
    });
    setDisplayState(DisplayState.ADD_REQUIREMENT);
  };

  const handleRequirementSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!tempQuestReq) {
      alert("Invalid requirement!");
      return;
    }

    if (tempQuestReq.name === "") {
      alert("You must enter a description for this requirement!");
      return;
    }

    if (tempQuestReq.name.length > 100) {
      alert("Requirement description must be 100 characters or less!");
      return;
    }

    if (tempQuestReq.numSigsRequired <= 0) {
      alert("You must require at least one signature");
      return;
    }
    if (tempQuestReq.numSigsRequired > tempQuestReq.ids.length) {
      alert(
        "You cannot require more signatures than the number of ids you have entered"
      );
      return;
    }

    const response = await fetch("/api/quest/validate_requirement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: tempQuestReq.type,
        ids: tempQuestReq.ids,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();

    if (!result.valid) {
      alert("One or more of the IDs you entered is invalid. Please try again.");
      return false;
    }

    setQuestReqs([...questReqs, tempQuestReq]);
    setTempQuestReq(undefined);
    setDisplayState(DisplayState.CREATE_QUEST_FORM);
  };

  return (
    <>
      {displayState === DisplayState.CREATE_QUEST_FORM && (
        <FormStepLayout
          title="Create quest"
          description=""
          onSubmit={handleQuestCreation}
        >
          <div className="mt-2 overflow-auto">
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
            <Button onClick={handleAddRequirement} size="md" align="left">
              <span>Add a requirement</span>
              <div className="ml-auto">
                <Icons.arrowRight />
              </div>
            </Button>
            <div className="flex flex-col gap-2">
              {questReqs.map((req, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {req.name}
                  </span>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {req.type}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {"IDs: " + req.ids.join(", ")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {"Num sigs required: " + req.numSigsRequired}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Button loading={loading} type="submit">
              Submit
            </Button>
            <Link href="/social" className="link text-center">
              Cancel
            </Link>
          </div>
        </FormStepLayout>
      )}
      {displayState === DisplayState.ADD_REQUIREMENT && tempQuestReq && (
        <FormStepLayout
          title="Quest requirement"
          description="Select a condition that must be met"
          onSubmit={handleRequirementSubmit}
        >
          <Input
            label="Requirement Description"
            placeholder="Enter a description for this requirement"
            type="string"
            name="requirementName"
            value={tempQuestReq.name}
            onChange={(event) =>
              setTempQuestReq({ ...tempQuestReq, name: event.target.value })
            }
            required
          />
          <div className="mb-4">
            <label
              htmlFor="typeSelect"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Requirement Type
            </label>
            <select
              id="typeSelect"
              name="type"
              value={tempQuestReq.type}
              onChange={(event) =>
                setTempQuestReq({
                  ...tempQuestReq,
                  type: event.target.value as "USER" | "LOCATION",
                })
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              required
            >
              <option value="USER">User</option>
              <option value="LOCATION">Location</option>
            </select>
          </div>
          <Input
            label="Requirement Ids"
            placeholder="Enter user/location ids, comma separated"
            type="text"
            name="reqIds"
            value={tempQuestReq.ids.join(",")}
            onChange={(event) =>
              setTempQuestReq({
                ...tempQuestReq,
                ids: event.target.value.split(","),
              })
            }
            required
          />
          <Input
            label="Number of Signatures Required"
            placeholder="Number of signatures required"
            type="number"
            name="numSigsRequired"
            value={tempQuestReq.numSigsRequired}
            onChange={(event) =>
              setTempQuestReq({
                ...tempQuestReq,
                numSigsRequired: parseInt(event.target.value),
              })
            }
            required
          />
          <div className="flex flex-col gap-4">
            <Button loading={loading} type="submit">
              Confirm
            </Button>
            <span
              onClick={() => setDisplayState(DisplayState.CREATE_QUEST_FORM)}
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

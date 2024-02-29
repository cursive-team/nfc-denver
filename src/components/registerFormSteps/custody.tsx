import { RegisterSchema } from "@/lib/schema/schema";
import { InferType } from "yup";
import { Button } from "../Button";
import { AppBackHeader } from "../AppHeader";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Checkbox } from "../Checkbox";
import { Radio } from "../Radio";
import { RegisterFormStepProps } from ".";
import { useStateMachine } from "little-state-machine";
import updateStateFromAction from "@/lib/shared/updateAction";
import { useEffect } from "react";

const RegisterCustodySchema = RegisterSchema.pick([
  "wantsServerCustody",
  "allowsAnalytics",
  "wantsExperimentalFeatures",
]);
type RegisterCustodyProps = InferType<typeof RegisterCustodySchema>;

const RegisterCustody = ({ onBack, onSuccess }: RegisterFormStepProps) => {
  const { actions, getState } = useStateMachine({ updateStateFromAction });

  const { handleSubmit, setValue, watch } = useForm<RegisterCustodyProps>({
    resolver: yupResolver(RegisterCustodySchema),
    defaultValues: {
      wantsServerCustody: getState()?.register?.wantsServerCustody ?? false,
      allowsAnalytics: getState()?.register?.allowsAnalytics ?? false,
      wantsExperimentalFeatures:
        getState()?.register?.wantsExperimentalFeatures ?? false,
    },
  });

  const wantsServerCustody = watch("wantsServerCustody", false);
  const allowsAnalytics = watch("allowsAnalytics", false);
  const wantsExperimentalFeatures = watch("wantsExperimentalFeatures", false);

  const handleCustodySubmit = () => {
    onSuccess?.(); // proceed to next step
  };

  useEffect(() => {
    // update state with form data on change
    actions?.updateStateFromAction({
      register: {
        ...getState()?.register,
        wantsServerCustody,
        allowsAnalytics,
        wantsExperimentalFeatures,
      },
    });
  }, [
    wantsServerCustody,
    allowsAnalytics,
    wantsExperimentalFeatures,
    actions,
    getState,
  ]);

  return (
    <div className="flex flex-col grow">
      <AppBackHeader
        label="Social settings"
        onBackClick={() => {
          onBack?.();
        }}
      />
      <FormStepLayout
        onSubmit={handleSubmit(handleCustodySubmit)}
        description="2/2"
        title="Ownership & analytics consent"
        className="xs:pt-4"
        header={
          <fieldset className="flex flex-col gap-6">
            <span className="text-gray-11 text-sm">
              IYK has partnerned with{" "}
              <a
                href="https://cursive.team"
                target="_blank"
                rel="noreferrer noopener"
              >
                <u>Cursive</u>
              </a>{" "}
              to integrate ZK tech into this experience to enable full data
              ownership and authenticity. Choose if you want to enable it.
            </span>
            <Radio
              id="selfCustody"
              name="custody"
              value="self"
              label="Self custody"
              description="Your ETHDenver interaction data is private to you, encrypted by a master password set on the next page. ZK proofs are used to prove quest completion."
              checked={!wantsServerCustody}
              onChange={() => {
                setValue("wantsServerCustody", false, {
                  shouldValidate: true,
                });
              }}
            />
            <Radio
              id="serverCustody"
              type="radio"
              name="custody"
              value="server"
              label="Server custody"
              description="Your ETHDenver interaction data can be read by the app server, but login just requires an email code."
              checked={wantsServerCustody}
              onChange={() => {
                setValue("wantsServerCustody", true, {
                  shouldValidate: true,
                });
              }}
            />
            <span>-----</span>
            <span className="text-gray-11 text-sm">
              Opt into experimental cryptographic features using MPC and FHE to
              privately compute shared taps with another user. You choose to
              enable it each time you tap, but it will incur a
              computation/bandwidth overhead.
            </span>
            <Checkbox
              id="wantsExperimentalFeatures"
              label="Enable experimental cryptographic features"
              checked={wantsExperimentalFeatures}
              onChange={() => {
                setValue(
                  "wantsExperimentalFeatures",
                  !wantsExperimentalFeatures,
                  {
                    shouldValidate: true,
                  }
                );
              }}
            />
          </fieldset>
        }
      >
        <Button type="submit">
          {wantsServerCustody ? "Create account" : "Next: Choose Password"}
        </Button>
      </FormStepLayout>
    </div>
  );
};

RegisterCustody.displayName = "RegisterCustody";
export { RegisterCustody };

import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Button } from "./Button";
import { Input } from "./Input";
import { useEffect, useState } from "react";
import {
  Profile,
  createBackup,
  getAuthToken,
  getProfile,
  saveProfile,
} from "@/lib/client/localStorage";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { Radio } from "./Radio";
import { Checkbox } from "./Checkbox";
import {
  displayNameRegex,
  farcasterUsernameRegex,
  handleNicknameChange,
  telegramUsernameRegex,
  twitterUsernameRegex,
} from "@/lib/shared/utils";
import { generateSalt, hashPassword } from "@/lib/client/utils";
import { encryptBackupString } from "@/lib/shared/backup";

enum ProfileDisplayState {
  VIEW,
  EDIT,
  INPUT_PASSWORD,
  CHOOSE_PASSWORD,
}

interface ProfileProps {
  handleSignout: () => void;
}

const Profile = ({ handleSignout }: ProfileProps) => {
  const router = useRouter();
  const [displayState, setDisplayState] = useState<ProfileDisplayState>(
    ProfileDisplayState.VIEW
  );
  const [previousProfile, setPreviousProfile] = useState<Profile>();
  const [displayName, setDisplayName] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [wantsServerCustody, setWantsServerCustody] = useState<boolean>();
  const [allowsAnalytics, setAllowsAnalytics] = useState<boolean>();
  const [twitterUsername, setTwitterUsername] = useState<string>("@");
  const [telegramUsername, setTelegramUsername] = useState<string>("@");
  const [farcasterUsername, setFarcasterUsername] = useState<string>("@");
  const [bio, setBio] = useState<string>();
  const [inputPassword, setInputPassword] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const [cachedPasswordSalt, setCachedPasswordSalt] = useState<string>();
  const [cachedPasswordHash, setCachedPasswordHash] = useState<string>();

  useEffect(() => {
    const authToken = getAuthToken();
    const profile = getProfile();

    if (!authToken || authToken.expiresAt < new Date() || !profile) {
      handleSignout();
      toast.error("You must be logged in to view this page");
      router.push("/login");
      return;
    }
    setPreviousProfile(profile);
    setDisplayName(profile.displayName);
    setEmail(profile.email);
    setWantsServerCustody(profile.wantsServerCustody);
    setAllowsAnalytics(profile.allowsAnalytics);
    setTwitterUsername("@" + (profile.twitterUsername || ""));
    setTelegramUsername("@" + (profile.telegramUsername || ""));
    setFarcasterUsername("@" + (profile.farcasterUsername || ""));
    setBio(profile.bio);
  }, [router, handleSignout]);

  const updateProfile = async () => {
    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      handleSignout();
      toast.error("You must be logged in to update your profile");
      router.push("/login");
      return;
    }

    if (!previousProfile) {
      console.error(
        "Could not connect to profile. Please refresh and try again."
      );
      return;
    }

    if (
      !displayName ||
      wantsServerCustody === undefined ||
      allowsAnalytics === undefined
    ) {
      toast.error("Please fill out all required fields.");
      return;
    }

    if (!displayNameRegex.test(displayName)) {
      toast.error(
        "Display name must be alphanumeric and less than 20 characters."
      );
      return;
    }

    if (
      twitterUsername !== "@" &&
      !twitterUsernameRegex.test(twitterUsername)
    ) {
      toast.error("Invalid Twitter username.");
      return;
    }

    if (
      telegramUsername !== "@" &&
      !telegramUsernameRegex.test(telegramUsername)
    ) {
      toast.error("Invalid Telegram username.");
      return;
    }

    if (
      farcasterUsername !== "@" &&
      !farcasterUsernameRegex.test(farcasterUsername)
    ) {
      toast.error("Invalid Farcaster username.");
      return;
    }

    if (bio && bio.length > 200) {
      toast.error("Bio must be less than 200 characters.");
      return;
    }

    let passwordSalt, passwordHash;
    if (!wantsServerCustody && previousProfile.wantsServerCustody) {
      if (!password || password !== confirmPassword) {
        toast.error("Invalid password");
        return;
      }
      passwordSalt = generateSalt();
      passwordHash = await hashPassword(password, passwordSalt);
    }

    const response = await fetch("/api/user/update_profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authToken: authToken.value,
        displayName,
        wantsServerCustody,
        allowsAnalytics,
        passwordSalt,
        passwordHash,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Error updating profile: ${data.error}`);
      toast.error("Error updating profile! Please try again.");
      return;
    }

    saveProfile({
      displayName,
      email: previousProfile.email,
      encryptionPublicKey: previousProfile.encryptionPublicKey,
      signaturePublicKey: previousProfile.signaturePublicKey,
      wantsServerCustody,
      allowsAnalytics,
      twitterUsername:
        twitterUsername === "@" ? undefined : twitterUsername.slice(1),
      telegramUsername:
        telegramUsername === "@" ? undefined : telegramUsername.slice(1),
      farcasterUsername:
        farcasterUsername === "@" ? undefined : farcasterUsername.slice(1),
      bio: bio === "" ? undefined : bio,
    });

    // Create new backup
    let backupData = createBackup();
    if (!backupData) {
      console.error("Error creating backup!");
      toast.error("Error creating backup! Please try again.");
      return;
    }

    const masterPassword =
      !wantsServerCustody && previousProfile.wantsServerCustody
        ? password
        : inputPassword;
    if (!wantsServerCustody && !masterPassword) {
      console.error("Master password required");
      toast.error("Master password required");
      return;
    }

    // Encrypt backup data if user wants self custody
    const backup = wantsServerCustody
      ? backupData
      : encryptBackupString(backupData, previousProfile.email, masterPassword!);

    const backupResponse = await fetch("/api/backup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        backup,
        wantsServerCustody,
        authToken: authToken.value,
      }),
    });

    if (!backupResponse.ok) {
      console.error("Error saving backup!");
      toast.error("Error saving backup! Please try again.");
      return;
    }

    setDisplayState(ProfileDisplayState.VIEW);
  };

  const handleBeginEdit = (event: React.FormEvent) => {
    event.preventDefault();
    setDisplayState(ProfileDisplayState.EDIT);
  };

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!previousProfile) {
      console.error(
        "Could not connect to profile. Please refresh and try again."
      );
      return;
    }

    if (
      displayName === previousProfile.displayName &&
      wantsServerCustody === previousProfile.wantsServerCustody &&
      allowsAnalytics === previousProfile.allowsAnalytics &&
      twitterUsername === "@" + (previousProfile.twitterUsername || "") &&
      telegramUsername === "@" + (previousProfile.telegramUsername || "") &&
      farcasterUsername === "@" + (previousProfile.farcasterUsername || "") &&
      bio === previousProfile.bio
    ) {
      toast.success("No changes made");
      setDisplayState(ProfileDisplayState.VIEW);
      return;
    }

    // User now wants self custody, need to set password
    if (!wantsServerCustody && previousProfile.wantsServerCustody) {
      setDisplayState(ProfileDisplayState.CHOOSE_PASSWORD);
      return;
    }

    // User needs to input self custody password to save new backup
    if (!wantsServerCustody) {
      setDisplayState(ProfileDisplayState.INPUT_PASSWORD);
      return;
    }

    await updateProfile();
  };

  const handleCancelEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!previousProfile) {
      console.error(
        "Could not connect to profile. Please refresh and try again."
      );
      return;
    }

    setDisplayName(previousProfile.displayName);
    setEmail(previousProfile.email);
    setTwitterUsername("@" + (previousProfile.twitterUsername || ""));
    setTelegramUsername("@" + (previousProfile.telegramUsername || ""));
    setFarcasterUsername("@" + (previousProfile.farcasterUsername || ""));
    setBio(previousProfile.bio);
    setDisplayState(ProfileDisplayState.VIEW);
  };

  const handleSubmitInputPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      handleSignout();
      toast.error("You must be logged in to update your profile");
      router.push("/login");
      return;
    }

    if (!inputPassword) {
      toast.error("Please enter your master password");
      return;
    }

    if (!cachedPasswordSalt || !cachedPasswordHash) {
      const response = await fetch(
        `/api/user/get_password_hash?token=${authToken.value}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Error getting password hash");
        toast.error("Error getting password hash");
        return;
      }

      const { passwordSalt, passwordHash } = await response.json();
      setCachedPasswordSalt(passwordSalt);
      setCachedPasswordHash(passwordHash);

      const derivedPasswordHash = await hashPassword(
        inputPassword,
        passwordSalt
      );
      if (derivedPasswordHash !== passwordHash) {
        toast.error("Incorrect password");
        return;
      }
    } else {
      const derivedPasswordHash = await hashPassword(
        inputPassword,
        cachedPasswordSalt
      );
      if (derivedPasswordHash !== cachedPasswordHash) {
        toast.error("Incorrect password");
        return;
      }
    }

    await updateProfile();
  };

  const handleSubmitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!previousProfile) {
      console.error(
        "Could not connect to profile. Please refresh and try again."
      );
      return;
    }

    await updateProfile();
  };

  const handleCancelPassword = (event: React.FormEvent) => {
    event.preventDefault();
    setPassword(undefined);
    setConfirmPassword(undefined);
    setDisplayState(ProfileDisplayState.EDIT);
  };

  const handleDisplayNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDisplayName(event.target.value);
  };

  const handleTwitterUsernameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTwitterUsername(handleNicknameChange(event));
  };

  const handleTelegramUsernameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTelegramUsername(handleNicknameChange(event));
  };

  const handleFarcasterUsernameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFarcasterUsername(handleNicknameChange(event));
  };

  const handleBioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBio(event.target.value);
  };

  const handleInputPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInputPassword(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value);
  };

  switch (displayState) {
    case ProfileDisplayState.VIEW:
      return (
        <FormStepLayout
          actions={
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={handleBeginEdit}>
                Edit
              </Button>
              <Button size="sm" onClick={handleSignout}>
                Logout
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-6">
            <Input label="Display name" value={displayName} disabled />
            <Input label="Email" value={email} disabled />
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-gray-12 text-sm font-light">
                Privacy settings
              </span>
              <Radio
                id="selfCustody"
                name="custody"
                value="self"
                label="Self custody"
                description="Your ETHDenver interaction data is private to you, encrypted by a master password set on the next page. ZK proofs are used to prove quest completion."
                checked={!wantsServerCustody}
                disabled
              />
              <Radio
                id="serverCustody"
                type="radio"
                name="custody"
                value="server"
                label="Server custody"
                description="Your ETHDenver interaction data is stored in plaintext, and may be shared with third parties."
                checked={wantsServerCustody}
                disabled
              />
              <Checkbox
                id="allowAnalytics"
                label="I consent to sharing analytics data"
                checked={allowsAnalytics}
                onChange={setAllowsAnalytics}
                disabled
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <Input
              label="Twitter (Optional)"
              value={twitterUsername}
              disabled
            />
            <Input
              label="Telegram (Optional)"
              value={telegramUsername}
              disabled
            />
            <Input
              label="Farcaster (Optional)"
              value={farcasterUsername}
              disabled
            />
            <Input label="Bio (Optional)" value={bio} disabled />
          </div>
        </FormStepLayout>
      );
    case ProfileDisplayState.EDIT:
      return (
        <FormStepLayout
          actions={
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button size="sm" onClick={handleCancelEdit}>
                Back
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-6">
            <Input
              label="Display name"
              value={displayName}
              onChange={handleDisplayNameChange}
            />
            <Input label="Email" value={email} disabled />
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-gray-12 text-sm font-light">
                Privacy settings
              </span>
              <Radio
                id="selfCustody"
                name="custody"
                value="self"
                label="Self custody"
                description="Your ETHDenver interaction data is private to you, encrypted by a master password set on the next page. ZK proofs are used to prove quest completion."
                checked={!wantsServerCustody}
                onChange={() => setWantsServerCustody(false)}
              />
              <Radio
                id="serverCustody"
                type="radio"
                name="custody"
                value="server"
                label="Server custody"
                description="Your ETHDenver interaction data is stored in plaintext, and may be shared with third parties."
                checked={wantsServerCustody}
                onChange={() => setWantsServerCustody(true)}
              />
              <Checkbox
                id="allowAnalytics"
                label="I consent to sharing analytics data"
                checked={allowsAnalytics}
                onChange={setAllowsAnalytics}
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <Input
              label="Twitter (Optional)"
              value={twitterUsername}
              onChange={handleTwitterUsernameChange}
            />
            <Input
              label="Telegram (Optional)"
              value={telegramUsername}
              onChange={handleTelegramUsernameChange}
            />
            <Input
              label="Farcaster (Optional)"
              value={farcasterUsername}
              onChange={handleFarcasterUsernameChange}
            />
            <Input
              label="Bio (Optional)"
              value={bio}
              onChange={handleBioChange}
            />
          </div>
        </FormStepLayout>
      );
    case ProfileDisplayState.INPUT_PASSWORD:
      return (
        <FormStepLayout
          title="Enter Password"
          description="Enter your master password to save your new profile"
          onSubmit={handleSubmitInputPassword}
        >
          <Input
            type="password"
            label="Password"
            value={inputPassword}
            onChange={handleInputPasswordChange}
            required
          />
          <Button type="submit">Confirm</Button>
        </FormStepLayout>
      );
    case ProfileDisplayState.CHOOSE_PASSWORD:
      return (
        <FormStepLayout
          title={
            <div className="flex flex-col gap-2">
              <span>Choose a master password</span>
            </div>
          }
          actions={
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={handleSubmitPassword}>
                Update Profile
              </Button>
              <Button size="sm" onClick={handleCancelPassword}>
                Back
              </Button>
            </div>
          }
        >
          <Input
            type="password"
            name="password"
            label="Master password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          <Input
            type="password"
            name="confirmPassword"
            label="Confirm master password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
          />
          <span className="text-gray-11 text-sm">
            This master password is used to encrypt a backup of your interaction
            data on our server. You are responsible for saving this password
            and/or manually backing up your data from the app.
          </span>
        </FormStepLayout>
      );
  }
};

export default Profile;

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function Explore() {
  const router = useRouter();
  const [cardId, setCardId] = useState<string>("");

  const onTap = (event: FormEvent) => {
    event.preventDefault();

    // TEMPORARY: For testing purposes, we'll just use the card ID as the CMAC
    const cmac = cardId;
    router.push(`/tap?cmac=${cmac}`);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCardId(event.target.value);
  };

  return (
    <FormStepLayout title="Tap your card" onSubmit={onTap}>
      <Input
        type="text"
        name="cardId"
        value={cardId}
        placeholder="Card ID"
        onChange={handleInputChange}
      />
      <Button type="submit">Tap</Button>
    </FormStepLayout>
  );
}

Explore.getInitialProps = () => {
  return { fullPage: true };
};

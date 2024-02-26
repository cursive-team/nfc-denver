import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function AdminTap() {
  const router = useRouter();
  const [chipId, setChipId] = useState<string>("");

  const onTap = (event: FormEvent) => {
    event.preventDefault();

    router.push(`/tap?iykRef=${chipId}&mockRef=true`);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChipId(event.target.value);
  };

  return (
    <FormStepLayout className="pt-4" title="Tap a chip" onSubmit={onTap}>
      <Input
        type="text"
        name="chipId"
        value={chipId}
        placeholder="Chip ID"
        onChange={handleInputChange}
      />
      <Button type="submit">Tap</Button>
    </FormStepLayout>
  );
}

AdminTap.getInitialProps = () => {
  return { fullPage: true };
};

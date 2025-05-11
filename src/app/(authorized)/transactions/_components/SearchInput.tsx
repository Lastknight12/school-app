"use client";

import { type ChangeEvent, useEffect, useState } from "react";

import { useDebounceValue } from "~/hooks/use-debounce-value";

import { Input } from "~/shadcn/ui/input";

interface Props {
  onInputChange: (name: string) => void;
}

export default function SearchInput({ onInputChange }: Props) {
  const [username, setUsername] = useState("");
  const debauncedValue = useDebounceValue(username, 800);

  useEffect(() => {
    if (!!debauncedValue) {
      onInputChange(debauncedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debauncedValue]);

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    setUsername(value);
  }

  return (
    <div>
      <Input
        variant="accent"
        placeholder="Search user by name or email..."
        value={username}
        onChange={handleInputChange}
      />
    </div>
  );
}

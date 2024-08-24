"use client";
import { type ChangeEvent, useEffect, useState } from "react";
import { useDebounceValue } from "~/hooks/useDebounceValue";

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
      <input
        type="text"
        className="mb-2 w-full rounded-lg border border-[#3d3d3d] bg-card px-3 py-2 outline-none placeholder:text-[#8f8f8f]"
        placeholder="Введіть ім'я користувача"
        value={username}
        onChange={handleInputChange}
      />
    </div>
  );
}

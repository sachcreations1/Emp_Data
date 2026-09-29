"use client";
import { Input } from "./ui/input";

export default function SearchBar({ setSearch }: { setSearch: (value: string) => void }) {
  return (
    <Input
      placeholder="Search by name or ID..."
      onChange={(e) => setSearch(e.target.value)}
      className="max-w-sm"
    />
  );
}

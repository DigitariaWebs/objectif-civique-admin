import { cn } from "@/lib/utils";

type Props = {
  name: string;
  size?: "sm" | "md" | "lg";
};

export function Avatar({ name, size = "md" }: Props) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className={cn("avatar", size === "lg" && "lg", size === "sm" && "sm")}>
      {initials}
    </div>
  );
}

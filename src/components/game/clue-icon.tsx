import {
  Droplet,
  Footprints,
  Ticket,
  Smartphone,
  FileText,
  KeyRound,
  Video,
  Receipt,
  Camera,
  Search,
  type LucideProps,
} from "lucide-react";

const map: Record<string, React.ComponentType<LucideProps>> = {
  Droplet,
  Footprints,
  Ticket,
  Smartphone,
  FileText,
  KeyRound,
  Video,
  Receipt,
  Camera,
  Search,
};

export function ClueIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = map[name] ?? Search;
  return <Icon {...props} />;
}

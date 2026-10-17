import type { MemeItem } from "@/data/memes";
import Card from "./Card";

type Props = {
  items: MemeItem[];
  onOpen: (index: number) => void;
  adminMode: boolean;
  deletingId: string | null;
  onDelete: (item: MemeItem) => void;
  currentAuthor: string;
};

export default function Grid({ items, onOpen, adminMode, deletingId, onDelete, currentAuthor }: Props) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <li key={item.id}>
          <Card
            item={item}
            onOpen={() => onOpen(index)}
            adminMode={adminMode}
            deleting={deletingId === item.id}
            onDelete={() => onDelete(item)}
            currentAuthor={currentAuthor}
          />
        </li>
      ))}
    </ul>
  );
}

"use client";

interface SelectedItemsChipsProps {
  items?: {id: string, name: string}[];
  setItems?: (selected: { id: string, name: string }[]) => void;
}

export default function SelectedItemsChips({
  items = [],
  setItems
}: SelectedItemsChipsProps) {
  const removeItem = (item: {id: string, name: string}) => {
    if (setItems && items) {
      const updated = items.filter(i => i.id !== item.id)
      setItems(updated);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
    {items.map((item) => (
      <div
        key={item.id}
        className="px-3 py-1 text-sm border rounded-full flex items-center gap-2"
      >
        <span>{item.name}</span>
        <button
          onClick={() =>
            removeItem(item)
          }
          className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
  );
}

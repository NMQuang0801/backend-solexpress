import { useMemo, useState } from 'react';

const useTableSelection = <T extends { id: number }>(items: T[]) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const isAllSelected = useMemo(
    () => items.length > 0 && selectedIds.length === items.length,
    [items, selectedIds]
  );

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  return {
    selectedIds,
    setSelectedIds,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  };
};

export default useTableSelection;

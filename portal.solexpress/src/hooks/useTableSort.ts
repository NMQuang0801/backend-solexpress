import { useState } from 'react';

const useTableSort = (defaultField = '', defaultDesc = false) => {
  const [sortField, setSortField] = useState(defaultField);
  const [isDesc, setIsDesc] = useState(defaultDesc);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setIsDesc((prev) => !prev);
    } else {
      setSortField(field);
      setIsDesc(true);
    }
  };

  const resetSort = () => {
    setSortField(defaultField);
    setIsDesc(defaultDesc);
  };

  return { sortField, setSortField, isDesc, setIsDesc, handleSort, resetSort };
};

export default useTableSort;

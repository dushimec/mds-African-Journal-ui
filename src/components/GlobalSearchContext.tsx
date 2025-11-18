import { createContext, useState, useContext } from "react";
type GlobalSearchContextType = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};
const GlobalSearchContext =  createContext<GlobalSearchContextType | null>(null);

export const GlobalSearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <GlobalSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </GlobalSearchContext.Provider>
  );
};

export const useGlobalSearch = () => useContext(GlobalSearchContext);

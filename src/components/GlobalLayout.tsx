import { useEffect } from "react";

const GlobalLayout = ({ logoUrl, journalTitle, children }) => {

  useEffect(() => {
    document.title = journalTitle;
  }, [journalTitle]);


useEffect(() => {
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;

  if (link) {
    link.href = logoUrl;
  } else {
    const newLink: HTMLLinkElement = document.createElement("link");
    newLink.rel = "icon";
    newLink.href = logoUrl;
    document.head.appendChild(newLink);
  }
}, [logoUrl]);


  return <>{children}</>;
};

export default GlobalLayout;

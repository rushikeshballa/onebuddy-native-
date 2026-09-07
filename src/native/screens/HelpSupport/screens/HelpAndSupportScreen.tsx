import { useState } from "react";
import { ScreenView } from "../types";
import SupportHomeScreen from "./SupportHomeScreen";
import ChatScreen from "./ChatScreen";

export default function HelpAndSupportScreen() {
  const [view, setView] = useState<ScreenView>("support");

  if (view === "chat") {
    return <ChatScreen onBack={() => setView("support")} />;
  }

  return <SupportHomeScreen onOpenChat={() => setView("chat")} />;
}

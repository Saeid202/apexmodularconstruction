import { Metadata } from "next";
import { ApexAIAssistant } from "@/components/ai-assistant/ApexAIAssistant";

export const metadata: Metadata = {
  title: "Apex AI Assistant | Modular Construction Expert",
  description: "Ask anything about our modular buildings, products, pricing, shipping, and more. Our AI assistant is here to help.",
};

export default function AIAssistantPage() {
  return (
    <div className="w-full h-screen overflow-hidden bg-white">
      <ApexAIAssistant />
    </div>
  );
}

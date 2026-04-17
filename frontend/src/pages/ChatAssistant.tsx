import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, ArrowLeft, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import AppHeader from "@/components/AppHeader";

interface Message {
  role: "ai" | "user";
  text: string;
}

const aiResponses = [
  "Based on the analysis, I can help explain the findings. The AI detected some characteristics that our medical team has reviewed. Would you like me to break down the results in simpler terms?",
  "I understand your concern. Please note that I'm here to help communicate between you and your healthcare provider. I cannot make medical decisions, but I can help explain what the report means.",
  "The doctor has reviewed your report and provided their assessment. Based on their expertise, they've given recommendations which you can see in the report section. Would you like me to clarify anything specific?",
  "That's a great question. The confidence percentage indicates how certain the AI model is about its detection. However, the final medical opinion always comes from your doctor.",
  "I'd recommend following the doctor's suggestion in the report. If a consultation has been recommended, booking an appointment with a dermatologist would be the best next step.",
  "Remember, early detection and proper medical consultation are key to maintaining nail health. Is there anything else about the report you'd like me to explain?",
];

const ChatAssistant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { analyses, currentAnalysis } = useApp();
  const analysis = analyses.find(a => a.id === id) || currentAnalysis;
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: `Hello! I'm your AI health assistant. ${analysis ? `I can see your analysis for "${analysis.condition}" with ${analysis.confidence.toFixed(2)}% confidence. I'm here to help explain the results and facilitate communication with your doctor. How can I help you?` : "How can I assist you today?"}`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const responseIdx = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const resp = aiResponses[responseIdx.current % aiResponses.length];
      responseIdx.current++;
      setMessages(prev => [...prev, { role: "ai", text: resp }]);
      setTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="container flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">AI Health Assistant</p>
            <p className="text-xs text-muted-foreground">Mediator between patient & doctor</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="container max-w-2xl space-y-3">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex items-end gap-2 max-w-[85%]">
                {m.role === "ai" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div className={m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                  <p className="text-sm">{m.text}</p>
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {typing && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="chat-bubble-ai">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card p-4">
        <div className="container max-w-2xl flex gap-2">
          <Input placeholder="Ask about your results..." value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()} className="flex-1" />
          <Button onClick={send} className="btn-primary-gradient border-0" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;

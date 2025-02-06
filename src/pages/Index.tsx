
import { useNavigate } from "react-router-dom";
import { Code2, Database, Globe, FileCode, Blocks, Server } from "lucide-react";
import { LanguageCard } from "@/components/LanguageCard";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { name: "Python", icon: Code2, path: "/generate/python" },
  { name: "SQL", icon: Database, path: "/generate/sql" },
  { name: "HTML", icon: Globe, path: "/generate/html" },
  { name: "JavaScript", icon: FileCode, path: "/generate/javascript" },
  { name: "React", icon: Blocks, path: "/generate/react" },
  { name: "Node.js", icon: Server, path: "/generate/nodejs" },
];

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLanguageSelect = (path: string) => {
    navigate(path);
    toast({
      title: "Language selected",
      description: "Preparing question generation interface...",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          AI-Powered Objective Content Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Generate high-quality multiple choice questions for programming languages
          using advanced AI technology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {languages.map((lang) => (
          <LanguageCard
            key={lang.name}
            icon={lang.icon}
            name={lang.name}
            onClick={() => handleLanguageSelect(lang.path)}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;

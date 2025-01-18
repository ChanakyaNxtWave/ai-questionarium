import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function Prompts() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [editingPrompt, setEditingPrompt] = React.useState<string | null>(null);
  const [content, setContent] = React.useState("");

  const { data: prompts, isLoading, error } = useQuery({
    queryKey: ["prompts"],
    queryFn: async () => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("type");
      
      if (error) {
        console.error("Error fetching prompts:", error);
        throw error;
      }
      return data;
    },
    enabled: !!user, // Only run query if user is authenticated
  });

  const handleEdit = (promptId: string, promptContent: string) => {
    setEditingPrompt(promptId);
    setContent(promptContent);
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be authenticated to edit prompts",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("prompts")
        .update({ content })
        .eq("id", editingPrompt);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prompt updated successfully",
      });

      setEditingPrompt(null);
    } catch (error) {
      console.error("Error updating prompt:", error);
      toast({
        title: "Error",
        description: "Failed to update prompt. Make sure you have the required permissions.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p>You must be authenticated to view and edit prompts.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">
          Failed to load prompts. Make sure you have the required permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Prompts</h1>
      <div className="space-y-6">
        {prompts?.map((prompt) => (
          <Card key={prompt.id} className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold capitalize">
                {prompt.type} Prompt
              </h2>
              {editingPrompt !== prompt.id ? (
                <Button onClick={() => handleEdit(prompt.id, prompt.content)}>
                  Edit
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setEditingPrompt(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save</Button>
                </div>
              )}
            </div>
            {editingPrompt === prompt.id ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px]"
              />
            ) : (
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md">
                {prompt.content}
              </pre>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
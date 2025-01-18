import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingIndicator } from "@/components/LoadingIndicator";

interface PromptForm {
  type: "topics" | "questions";
  content: string;
  language_id: string | null;
  is_default: boolean;
}

interface Language {
  id: string;
  name: string;
}

const PromptManagement = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<PromptForm>();

  useEffect(() => {
    checkMasterAccess();
    fetchData();
  }, []);

  const checkMasterAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== "master@example.com") {
      navigate("/");
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this page.",
      });
    }
  };

  const fetchData = async () => {
    try {
      const [languagesResponse, promptsResponse] = await Promise.all([
        supabase.from("programming_languages").select("*"),
        supabase.from("prompts").select("*"),
      ]);

      if (languagesResponse.error) throw languagesResponse.error;
      if (promptsResponse.error) throw promptsResponse.error;

      setLanguages(languagesResponse.data);
      setPrompts(promptsResponse.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PromptForm) => {
    try {
      const { error } = await supabase.from("prompts").upsert({
        type: data.type,
        content: data.content,
        language_id: data.language_id,
        is_default: data.is_default,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prompt saved successfully",
      });

      fetchData();
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Prompt Management</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add/Edit Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select prompt type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="topics">Topics</SelectItem>
                          <SelectItem value="questions">Questions</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Programming Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.id} value={lang.id}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={10}
                          placeholder="Enter prompt content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_default"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="w-4 h-4"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Set as default</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Save Prompt</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prompts.map((prompt) => (
                <Card key={prompt.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">Type: {prompt.type}</h3>
                      {prompt.language_id && (
                        <p className="text-sm text-muted-foreground">
                          Language:{" "}
                          {
                            languages.find((l) => l.id === prompt.language_id)
                              ?.name
                          }
                        </p>
                      )}
                      {prompt.is_default && (
                        <span className="text-sm text-green-600">Default</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.reset(prompt);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{prompt.content}</p>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromptManagement;
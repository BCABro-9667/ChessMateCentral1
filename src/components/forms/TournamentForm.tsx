// src/components/forms/TournamentForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, Sparkles, Loader2, Info } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateTournamentDescription, type GenerateTournamentDescriptionInput } from "@/ai/flows/generate-tournament-description";
import type { Tournament } from "@/types/tournament";
import { tournamentTypes } from "@/types/tournament";

const tournamentFormSchema = z.object({
  name: z.string().min(3, "Tournament name must be at least 3 characters.").max(100),
  type: z.enum(tournamentTypes),
  location: z.string().min(3, "Location must be at least 3 characters.").max(100),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
  entryFee: z.coerce.number().min(0, "Entry fee cannot be negative."),
  prizeFund: z.coerce.number().min(0, "Prize fund cannot be negative."),
  timeControl: z.string().min(3, "Time control must be specified.").max(50),
  description: z.string().min(10, "Description must be at least 10 characters.").max(2000),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date cannot be before start date.",
  path: ["endDate"],
});

type TournamentFormValues = z.infer<typeof tournamentFormSchema>;

interface TournamentFormProps {
  onSubmit: (data: TournamentFormValues) => Promise<void>;
  initialData?: Partial<Tournament>; // For editing
  isLoading?: boolean;
}

export default function TournamentForm({ onSubmit, initialData, isLoading: isSubmittingForm }: TournamentFormProps) {
  const { toast } = useToast();
  const [isAiLoading, setIsAiLoading] = useState(false);

  const defaultValues: Partial<TournamentFormValues> = {
    name: initialData?.name || "",
    type: initialData?.type || "Swiss",
    location: initialData?.location || "",
    startDate: initialData?.startDate ? parseISO(initialData.startDate) : undefined,
    endDate: initialData?.endDate ? parseISO(initialData.endDate) : undefined,
    entryFee: initialData?.entryFee || 0,
    prizeFund: initialData?.prizeFund || 0,
    timeControl: initialData?.timeControl || "",
    description: initialData?.description || "",
  };

  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleGenerateDescription = useCallback(async () => {
    const values = form.getValues();
    const aiInput: GenerateTournamentDescriptionInput = {
      tournamentName: values.name,
      tournamentType: values.type,
      tournamentLocation: values.location,
      tournamentStartDate: values.startDate ? format(values.startDate, "MMMM d, yyyy") : "Not set",
      tournamentEndDate: values.endDate ? format(values.endDate, "MMMM d, yyyy") : "Not set",
      entryFee: values.entryFee,
      prizeFund: values.prizeFund,
      timeControl: values.timeControl,
    };

    if (!aiInput.tournamentName || !aiInput.tournamentType || !aiInput.tournamentLocation || !aiInput.timeControl) {
        toast({
            title: "Missing Information for AI",
            description: "Please fill in Name, Type, Location, and Time Control before generating description.",
            variant: "destructive",
        });
        return;
    }

    setIsAiLoading(true);
    try {
      const result = await generateTournamentDescription(aiInput);
      if (result.description) {
        form.setValue("description", result.description, { shouldValidate: true });
        toast({
          title: "AI Description Generated!",
          description: "The tournament description has been updated.",
        });
      } else {
        toast({
          title: "AI Generation Issue",
          description: "The AI couldn't generate a description. Please try again or write one manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("AI Description generation error:", error);
      toast({
        title: "Error Generating Description",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  }, [form, toast]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tournament Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., City Open Championship" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tournament Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tournament type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tournamentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Central Community Hall" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < (form.getValues("startDate") || new Date(new Date().setHours(0,0,0,0)))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="entryFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Fee ($)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 25" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prizeFund"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Prize Fund ($)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 1000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
            control={form.control}
            name="timeControl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Control</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., G/90+30 (90 minutes + 30s increment)" {...field} />
                </FormControl>
                <FormDescription>
                  Specify the time control format (e.g., G/60, 45+45, etc.).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Tournament Description</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={isAiLoading}
                >
                  {isAiLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4 text-accent" />
                  )}
                  Generate with AI
                </Button>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Provide an engaging description of the tournament..."
                  className="min-h-[150px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex items-center gap-1">
                 <Info size={14}/> You can manually edit this description after AI generation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full md:w-auto text-lg py-3" disabled={isSubmittingForm || isAiLoading}>
          {isSubmittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {initialData?.id ? 'Update Tournament' : 'Create Tournament'}
        </Button>
      </form>
    </Form>
  );
}

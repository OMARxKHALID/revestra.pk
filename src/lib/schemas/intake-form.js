import { z } from "zod";

export const intakeFormSchema = z.object({
  brand: z.string().trim().min(1, "Who made it?"),
  name: z.string().trim().min(2, "Give it a name"),
  sizeLabel: z.string().trim().min(1, "Enter the size as labelled"),
  tagline: z.string().trim().min(3, "One line that sells it"),
  conditionNotes: z.string().trim().max(300).optional().or(z.literal("")),
  lot: z.string().trim().max(40).optional().or(z.literal("")),
  image: z
    .string()
    .trim()
    .startsWith("/assets/", "Photo path must start with /assets/"),
  description: z.string().trim().min(20, "Describe it in a sentence or two"),
  details: z.string().trim().min(3, "At least one detail line"),
});

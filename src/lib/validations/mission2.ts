import { z } from "zod";

export const createTeamSchema = z.object({
    name: z.string().min(2, "Nama tim minimal 2 karakter").max(50),
    selected_case: z.enum([
        "plastik_kantin",
        "alih_fungsi_lahan",
        "pencemaran_air",
    ]),
    leader_id: z.string().uuid(),
});

export const brainstormingSchema = z.object({
    env_problem: z.string().min(10, "Minimal 10 karakter"),
    social_problem: z.string().min(10, "Minimal 10 karakter"),
    solution: z.string().min(10, "Minimal 10 karakter"),
    solution_reason: z.string().min(10, "Minimal 10 karakter"),
    action_type: z.enum(["poster", "surat_usulan", "filter_air", "lainnya"]),
    action_custom: z.string().optional(),
    action_name: z.string().min(2, "Minimal 2 karakter"),
    materials: z.string().min(5, "Minimal 5 karakter"),
    target_audience: z.string().min(3, "Minimal 3 karakter"),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type BrainstormingInput = z.infer<typeof brainstormingSchema>;
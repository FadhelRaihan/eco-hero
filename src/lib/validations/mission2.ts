import { z } from "zod";

export const createTeamSchema = z.object({
    name: z.string().min(2, "Nama tim minimal 2 karakter").max(50),
    selected_case: z.enum([
        "sampah",
        "kendaraan",
    ]),
    leader_id: z.string().uuid(),
});

export const brainstormingSchema = z.object({
    env_problem: z.string().min(1, "Wajib diisi"),
    social_problem: z.string().min(1, "Wajib diisi"),
    solution: z.string().min(1, "Wajib diisi"),
    solution_reason: z.string().min(1, "Wajib diisi"),
    action_type: z.string().min(1, "Wajib diisi"),
    action_name: z.string().min(1, "Wajib diisi"),
    materials: z.string().min(1, "Wajib diisi"),
    target_audience: z.string().min(1, "Wajib diisi"),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type BrainstormingInput = z.infer<typeof brainstormingSchema>;
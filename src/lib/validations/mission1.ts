import { z } from "zod";

export const forumPostSchema = z.object({
    case_topic: z.enum(
        ["plastik_kantin", "alih_fungsi_lahan", "pencemaran_air"],
        { message: "Pilih topik kasus terlebih dahulu" }
    ),
    perspective_env: z
        .string()
        .min(20, "Sudut pandang lingkungan minimal 20 karakter")
        .max(1000, "Terlalu panjang"),
    perspective_soc: z
        .string()
        .min(20, "Sudut pandang sosial minimal 20 karakter")
        .max(1000, "Terlalu panjang"),
});

export const forumCommentSchema = z.object({
    content: z
        .string()
        .min(5, "Komentar minimal 5 karakter")
        .max(500, "Komentar maksimal 500 karakter"),
});

export const questionAnswerSchema = z.object({
    answer: z
        .string()
        .min(10, "Jawaban minimal 10 karakter")
        .max(1000, "Jawaban terlalu panjang"),
});

export type ForumPostInput = z.infer<typeof forumPostSchema>;
export type ForumCommentInput = z.infer<typeof forumCommentSchema>;
export type QuestionAnswerInput = z.infer<typeof questionAnswerSchema>;
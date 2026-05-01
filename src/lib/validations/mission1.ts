import { z } from "zod";

export const forumPostSchema = z.object({
    case_topic: z.enum(
        ["sampah", "kendaraan"],
        { message: "Pilih topik kasus terlebih dahulu" }
    ),
    perspective_env: z.string().min(1, "Pendapat wajib diisi"),
    perspective_soc: z.string().optional(),
});

export const forumCommentSchema = z.object({
    content: z.string().min(1, "Komentar wajib diisi"),
});

export const questionAnswerSchema = z.object({
    answer: z.string().min(1, "Jawaban wajib diisi"),
});

export type ForumPostInput = z.infer<typeof forumPostSchema>;
export type ForumCommentInput = z.infer<typeof forumCommentSchema>;
export type QuestionAnswerInput = z.infer<typeof questionAnswerSchema>;
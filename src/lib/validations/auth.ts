import { z } from "zod";

export const guruLoginSchema = z.object({
    username: z.string().min(1, "Username tidak boleh kosong"),
    password: z.string().min(1, "Password tidak boleh kosong"),
});

export const siswaLoginSchema = z.object({
    full_name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama terlalu panjang").regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh huruf dan spasi"),
    class_id: z.string().uuid("Kelas tidak valid"),
})

export type GuruLoginInput = z.infer<typeof guruLoginSchema>;
export type SiswaLoginInput = z.infer<typeof siswaLoginSchema>;
export type Role = "guru" | "siswa";
export type TeamRole = "ketua" | "anggota" | "belum_pilih";
export type MissionStatus = "locked" | "in_progress" | "completed";
export type TeamMissionStatus = "in_progress" | "completed";
export type TaskStatus = "belum" | "sedang" | "selesai";
export type SelectedCase = "sampah" | "kendaraan";
export type ActionType = string;
export type MediaType = "foto" | "video" | "pdf";

export interface User {
  id: string;
  full_name: string;
  role: Role;
  username?: string;
  password_hash?: string;
  created_at: string;
}

export interface StudentSession {
  id: string;
  student_id: string;
  token: string;
  expired_at: string;
  created_at: string;
}

export interface ClassMember {
  id: string;
  class_id: string;
  student_id: string;
  team_role: TeamRole;
  joined_at: string;
}

export interface Team {
  id: string;
  class_id: string;
  name: string;
  leader_id: string;
  selected_case: SelectedCase;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  student_id: string;
}

export interface MissionProgress {
  id: string;
  student_id: string;
  class_id: string;
  mission_number: number;
  status: MissionStatus;
  mission1_step: number;
  mission1_video_watched: boolean;
  mission1_question_answer: string | null;
  mission1_case: string | null;
  mission2_step: number;
  pretest_status: MissionStatus;
  posttest_status: MissionStatus;
  badge_earned: boolean;
  completed_at?: string;
  updated_at: string;
}

export interface Test {
  id: string;
  class_id: string;
  type: "pretest" | "posttest";
  title: string;
  is_active: boolean;
  created_at: string;
}

export interface TestQuestion {
  id: string;
  test_id: string;
  question_text: string;
  options: string[]; // ["Option A", "Option B", ...]
  correct_answer: number; // Index of correct option
  order_index: number;
}

export interface TestSubmission {
  id: string;
  test_id: string;
  student_id: string;
  answers: Record<string, number>; // { question_id: selected_index }
  score: number;
  submitted_at: string;
}

export interface TeamMissionProgress {
  id: string;
  team_id: string;
  mission_number: number;
  status: TeamMissionStatus;
  completed_at?: string;
  update_at: string;
}

export interface Mission1ForumPost {
  id: string;
  class_id: string;
  student_id: string;
  case_topic: SelectedCase;
  perspective_env: string;
  perspective_soc: string;
  created_at: string;
}

export interface Mission1ForumComment {
  id: string;
  post_id: string;
  student_id: string;
  content: string;
  created_at: string;
}

export interface Mission2Submission {
  id: string;
  team_id: string;
  env_problem: string;
  social_problem: string;
  solution: string;
  solution_reason: string;
  action_type: string;
  action_name: string;
  materials: string;
  target_audience: string;
  submitted_at?: string;
  updated_at: string;
}

export interface Mission3Schedule {
  id: string;
  team_id: string;
  teacher_approved: boolean;
  approved_at?: string;
  submitted_at?: string;
  updated_at: string;
}

export interface Mission3Task {
  id: string;
  schedule_id: string;
  title: string;
  assigned_to: string;
  scheduled_date: string;
  status: TaskStatus;
  created_at: string;
}

export interface Mission4Submission {
  id: string;
  team_id: string;
  cloudinary_url: string;
  media_type: MediaType;
  caption?: string;
  uploaded_at: string;
}

export interface Mission4GalleryLike {
  id: string;
  submission_id: string;
  student_id: string;
  created_at: string;
}

export interface Mission4GalleryComment {
  id: string;
  submission_id: string;
  student_id: string;
  content: string;
  created_at: string;
}

export interface Mission4Reflection {
  id: string;
  student_id: string;
  team_id: string;
  feeling: string;
  commitment: string;
  submitted_at: string;
}
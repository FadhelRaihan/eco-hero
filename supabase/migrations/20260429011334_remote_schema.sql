


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."class_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "class_id" "uuid",
    "student_id" "uuid",
    "team_role" character varying(20) DEFAULT 'belum_pilih'::character varying,
    "joined_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "class_members_team_role_check" CHECK ((("team_role")::"text" = ANY ((ARRAY['ketua'::character varying, 'anggota'::character varying, 'belum_pilih'::character varying])::"text"[])))
);


ALTER TABLE "public"."class_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."classes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "teacher_id" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."classes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mission1_forum_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid",
    "student_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."mission1_forum_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mission1_forum_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "class_id" "uuid",
    "student_id" "uuid",
    "case_topic" character varying(30),
    "perspective_env" "text" NOT NULL,
    "perspective_soc" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "mission1_forum_posts_case_topic_check" CHECK ((("case_topic")::"text" = ANY ((ARRAY['sampah'::character varying, 'kendaraan'::character varying])::"text"[])))
);


ALTER TABLE "public"."mission1_forum_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mission2_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid",
    "env_problem" "text",
    "social_problem" "text",
    "solution" "text",
    "solution_reason" "text",
    "action_type" "text",
    "action_custom" character varying(200),
    "action_name" character varying(200),
    "materials" "text",
    "target_audience" character varying(200),
    "submitted_at" timestamp without time zone,
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."mission2_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mission3_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid",
    "teacher_approved" boolean DEFAULT false,
    "approved_at" timestamp without time zone,
    "submitted_at" timestamp without time zone,
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."mission3_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mission3_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "schedule_id" "uuid",
    "title" character varying(200) NOT NULL,
    "assigned_to" "uuid",
    "scheduled_date" "date",
    "status" character varying(10) DEFAULT 'belum'::character varying,
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "mission3_tasks_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['belum'::character varying, 'sedang'::character varying, 'selesai'::character varying])::"text"[])))
);


ALTER TABLE "public"."mission3_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mission4_gallery_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "submission_id" "uuid",
    "student_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."mission4_gallery_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mission4_gallery_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "submission_id" "uuid",
    "student_id" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."mission4_gallery_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mission4_reflections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid",
    "team_id" "uuid",
    "feeling" "text" NOT NULL,
    "commitment" "text" NOT NULL,
    "submitted_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."mission4_reflections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mission4_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid",
    "cloudinary_url" character varying NOT NULL,
    "media_type" character varying(10),
    "caption" character varying(300),
    "uploaded_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "mission4_submissions_media_type_check" CHECK ((("media_type")::"text" = ANY ((ARRAY['foto'::character varying, 'video'::character varying, 'pdf'::character varying])::"text"[])))
);


ALTER TABLE "public"."mission4_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mission_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid",
    "class_id" "uuid",
    "mission_number" integer NOT NULL,
    "status" character varying(20) DEFAULT 'locked'::character varying,
    "mission1_step" integer DEFAULT 1,
    "badge_earned" boolean DEFAULT false,
    "completed_at" timestamp without time zone,
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "mission1_video_watched" boolean DEFAULT false,
    "mission1_question_answer" "text",
    "mission2_step" integer DEFAULT 1,
    "mission1_case" "text",
    "pretest_status" "text" DEFAULT 'locked'::"text",
    "posttest_status" "text" DEFAULT 'locked'::"text",
    CONSTRAINT "mission_progress_mission1_step_check" CHECK ((("mission1_step" >= 1) AND ("mission1_step" <= 4))),
    CONSTRAINT "mission_progress_mission_number_check" CHECK ((("mission_number" >= 1) AND ("mission_number" <= 4))),
    CONSTRAINT "mission_progress_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['locked'::character varying, 'in_progress'::character varying, 'completed'::character varying])::"text"[])))
);


ALTER TABLE "public"."mission_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid",
    "token" character varying NOT NULL,
    "expired_at" timestamp without time zone NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."student_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid",
    "student_id" "uuid"
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_mission_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid",
    "mission_number" integer NOT NULL,
    "status" character varying(20) DEFAULT 'in_progress'::character varying,
    "completed_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "team_mission_progress_mission_number_check" CHECK ((("mission_number" >= 2) AND ("mission_number" <= 4))),
    CONSTRAINT "team_mission_progress_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['in_progress'::character varying, 'completed'::character varying])::"text"[])))
);


ALTER TABLE "public"."team_mission_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "class_id" "uuid",
    "name" character varying(100) NOT NULL,
    "leader_id" "uuid",
    "selected_case" character varying(30),
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "teams_selected_case_check" CHECK ((("selected_case")::"text" = ANY ((ARRAY['sampah'::character varying, 'kendaraan'::character varying])::"text"[])))
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."test_questions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "test_id" "uuid",
    "question_text" "text" NOT NULL,
    "options" "jsonb" NOT NULL,
    "correct_answer" integer NOT NULL,
    "order_index" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."test_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."test_submissions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "test_id" "uuid",
    "student_id" "uuid",
    "answers" "jsonb" NOT NULL,
    "score" double precision NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."test_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "class_id" "uuid",
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "tests_type_check" CHECK (("type" = ANY (ARRAY['pretest'::"text", 'posttest'::"text"])))
);


ALTER TABLE "public"."tests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" character varying(100) NOT NULL,
    "role" character varying(10) NOT NULL,
    "username" character varying(100),
    "password_hash" character varying,
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "users_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['guru'::character varying, 'siswa'::character varying])::"text"[])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."class_members"
    ADD CONSTRAINT "class_members_class_id_student_id_key" UNIQUE ("class_id", "student_id");



ALTER TABLE ONLY "public"."class_members"
    ADD CONSTRAINT "class_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mission1_forum_comments"
    ADD CONSTRAINT "mission1_forum_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mission1_forum_posts"
    ADD CONSTRAINT "mission1_forum_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mission2_submissions"
    ADD CONSTRAINT "mission2_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mission2_submissions"
    ADD CONSTRAINT "mission2_submissions_team_id_key" UNIQUE ("team_id");



ALTER TABLE ONLY "public"."mission3_schedules"
    ADD CONSTRAINT "mission3_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mission3_schedules"
    ADD CONSTRAINT "mission3_schedules_team_id_key" UNIQUE ("team_id");



ALTER TABLE ONLY "public"."mission3_tasks"
    ADD CONSTRAINT "mission3_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mission4_gallery_comments"
    ADD CONSTRAINT "mission4_gallery_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mission4_gallery_likes"
    ADD CONSTRAINT "mission4_gallery_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mission4_gallery_likes"
    ADD CONSTRAINT "mission4_gallery_likes_submission_id_student_id_key" UNIQUE ("submission_id", "student_id");



ALTER TABLE ONLY "public"."mission4_reflections"
    ADD CONSTRAINT "mission4_reflections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mission4_reflections"
    ADD CONSTRAINT "mission4_reflections_student_id_key" UNIQUE ("student_id");



ALTER TABLE ONLY "public"."mission4_submissions"
    ADD CONSTRAINT "mission4_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mission_progress"
    ADD CONSTRAINT "mission_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mission_progress"
    ADD CONSTRAINT "mission_progress_student_id_mission_number_key" UNIQUE ("student_id", "mission_number");



ALTER TABLE ONLY "public"."student_sessions"
    ADD CONSTRAINT "student_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_sessions"
    ADD CONSTRAINT "student_sessions_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_student_id_key" UNIQUE ("team_id", "student_id");



ALTER TABLE ONLY "public"."team_mission_progress"
    ADD CONSTRAINT "team_mission_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_mission_progress"
    ADD CONSTRAINT "team_mission_progress_team_id_mission_number_key" UNIQUE ("team_id", "mission_number");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test_questions"
    ADD CONSTRAINT "test_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test_submissions"
    ADD CONSTRAINT "test_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tests"
    ADD CONSTRAINT "tests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE UNIQUE INDEX "idx_tests_class_type" ON "public"."tests" USING "btree" ("class_id", "type");



ALTER TABLE ONLY "public"."class_members"
    ADD CONSTRAINT "class_members_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."class_members"
    ADD CONSTRAINT "class_members_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission1_forum_comments"
    ADD CONSTRAINT "mission1_forum_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."mission1_forum_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission1_forum_comments"
    ADD CONSTRAINT "mission1_forum_comments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission1_forum_posts"
    ADD CONSTRAINT "mission1_forum_posts_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission1_forum_posts"
    ADD CONSTRAINT "mission1_forum_posts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission2_submissions"
    ADD CONSTRAINT "mission2_submissions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission3_schedules"
    ADD CONSTRAINT "mission3_schedules_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission3_tasks"
    ADD CONSTRAINT "mission3_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."mission3_tasks"
    ADD CONSTRAINT "mission3_tasks_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."mission3_schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission4_gallery_comments"
    ADD CONSTRAINT "mission4_gallery_comments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission4_gallery_comments"
    ADD CONSTRAINT "mission4_gallery_comments_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."mission4_submissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission4_gallery_likes"
    ADD CONSTRAINT "mission4_gallery_likes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission4_gallery_likes"
    ADD CONSTRAINT "mission4_gallery_likes_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."mission4_submissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission4_reflections"
    ADD CONSTRAINT "mission4_reflections_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission4_reflections"
    ADD CONSTRAINT "mission4_reflections_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission4_submissions"
    ADD CONSTRAINT "mission4_submissions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission_progress"
    ADD CONSTRAINT "mission_progress_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mission_progress"
    ADD CONSTRAINT "mission_progress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_sessions"
    ADD CONSTRAINT "student_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_mission_progress"
    ADD CONSTRAINT "team_mission_progress_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."test_questions"
    ADD CONSTRAINT "test_questions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."test_submissions"
    ADD CONSTRAINT "test_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."test_submissions"
    ADD CONSTRAINT "test_submissions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tests"
    ADD CONSTRAINT "tests_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE;



ALTER TABLE "public"."class_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."classes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mission4_reflections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mission4_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_mission_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."test_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."test_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."mission1_forum_comments";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."mission1_forum_posts";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."mission2_submissions";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."mission3_schedules";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."mission3_tasks";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."mission4_gallery_comments";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."mission4_gallery_likes";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."mission_progress";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."team_members";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."teams";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";


















GRANT ALL ON TABLE "public"."class_members" TO "anon";
GRANT ALL ON TABLE "public"."class_members" TO "authenticated";
GRANT ALL ON TABLE "public"."class_members" TO "service_role";



GRANT ALL ON TABLE "public"."classes" TO "anon";
GRANT ALL ON TABLE "public"."classes" TO "authenticated";
GRANT ALL ON TABLE "public"."classes" TO "service_role";



GRANT ALL ON TABLE "public"."mission1_forum_comments" TO "anon";
GRANT ALL ON TABLE "public"."mission1_forum_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."mission1_forum_comments" TO "service_role";



GRANT ALL ON TABLE "public"."mission1_forum_posts" TO "anon";
GRANT ALL ON TABLE "public"."mission1_forum_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."mission1_forum_posts" TO "service_role";



GRANT ALL ON TABLE "public"."mission2_submissions" TO "anon";
GRANT ALL ON TABLE "public"."mission2_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."mission2_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."mission3_schedules" TO "anon";
GRANT ALL ON TABLE "public"."mission3_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."mission3_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."mission3_tasks" TO "anon";
GRANT ALL ON TABLE "public"."mission3_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."mission3_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."mission4_gallery_comments" TO "anon";
GRANT ALL ON TABLE "public"."mission4_gallery_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."mission4_gallery_comments" TO "service_role";



GRANT ALL ON TABLE "public"."mission4_gallery_likes" TO "anon";
GRANT ALL ON TABLE "public"."mission4_gallery_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."mission4_gallery_likes" TO "service_role";



GRANT ALL ON TABLE "public"."mission4_reflections" TO "anon";
GRANT ALL ON TABLE "public"."mission4_reflections" TO "authenticated";
GRANT ALL ON TABLE "public"."mission4_reflections" TO "service_role";



GRANT ALL ON TABLE "public"."mission4_submissions" TO "anon";
GRANT ALL ON TABLE "public"."mission4_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."mission4_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."mission_progress" TO "anon";
GRANT ALL ON TABLE "public"."mission_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."mission_progress" TO "service_role";



GRANT ALL ON TABLE "public"."student_sessions" TO "anon";
GRANT ALL ON TABLE "public"."student_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."student_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."team_mission_progress" TO "anon";
GRANT ALL ON TABLE "public"."team_mission_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."team_mission_progress" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."test_questions" TO "anon";
GRANT ALL ON TABLE "public"."test_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."test_questions" TO "service_role";



GRANT ALL ON TABLE "public"."test_submissions" TO "anon";
GRANT ALL ON TABLE "public"."test_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."test_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."tests" TO "anon";
GRANT ALL ON TABLE "public"."tests" TO "authenticated";
GRANT ALL ON TABLE "public"."tests" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































drop extension if exists "pg_net";

alter table "public"."class_members" drop constraint "class_members_team_role_check";

alter table "public"."mission1_forum_posts" drop constraint "mission1_forum_posts_case_topic_check";

alter table "public"."mission3_tasks" drop constraint "mission3_tasks_status_check";

alter table "public"."mission4_submissions" drop constraint "mission4_submissions_media_type_check";

alter table "public"."mission_progress" drop constraint "mission_progress_status_check";

alter table "public"."team_mission_progress" drop constraint "team_mission_progress_status_check";

alter table "public"."teams" drop constraint "teams_selected_case_check";

alter table "public"."users" drop constraint "users_role_check";

alter table "public"."class_members" add constraint "class_members_team_role_check" CHECK (((team_role)::text = ANY ((ARRAY['ketua'::character varying, 'anggota'::character varying, 'belum_pilih'::character varying])::text[]))) not valid;

alter table "public"."class_members" validate constraint "class_members_team_role_check";

alter table "public"."mission1_forum_posts" add constraint "mission1_forum_posts_case_topic_check" CHECK (((case_topic)::text = ANY ((ARRAY['sampah'::character varying, 'kendaraan'::character varying])::text[]))) not valid;

alter table "public"."mission1_forum_posts" validate constraint "mission1_forum_posts_case_topic_check";

alter table "public"."mission3_tasks" add constraint "mission3_tasks_status_check" CHECK (((status)::text = ANY ((ARRAY['belum'::character varying, 'sedang'::character varying, 'selesai'::character varying])::text[]))) not valid;

alter table "public"."mission3_tasks" validate constraint "mission3_tasks_status_check";

alter table "public"."mission4_submissions" add constraint "mission4_submissions_media_type_check" CHECK (((media_type)::text = ANY ((ARRAY['foto'::character varying, 'video'::character varying, 'pdf'::character varying])::text[]))) not valid;

alter table "public"."mission4_submissions" validate constraint "mission4_submissions_media_type_check";

alter table "public"."mission_progress" add constraint "mission_progress_status_check" CHECK (((status)::text = ANY ((ARRAY['locked'::character varying, 'in_progress'::character varying, 'completed'::character varying])::text[]))) not valid;

alter table "public"."mission_progress" validate constraint "mission_progress_status_check";

alter table "public"."team_mission_progress" add constraint "team_mission_progress_status_check" CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'completed'::character varying])::text[]))) not valid;

alter table "public"."team_mission_progress" validate constraint "team_mission_progress_status_check";

alter table "public"."teams" add constraint "teams_selected_case_check" CHECK (((selected_case)::text = ANY ((ARRAY['sampah'::character varying, 'kendaraan'::character varying])::text[]))) not valid;

alter table "public"."teams" validate constraint "teams_selected_case_check";

alter table "public"."users" add constraint "users_role_check" CHECK (((role)::text = ANY ((ARRAY['guru'::character varying, 'siswa'::character varying])::text[]))) not valid;

alter table "public"."users" validate constraint "users_role_check";






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



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."call_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "call_id" "uuid" NOT NULL,
    "phone_number" "text" NOT NULL,
    "role" "text" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"(),
    "left_at" timestamp with time zone,
    CONSTRAINT "call_participants_role_check" CHECK (("role" = ANY (ARRAY['caller'::"text", 'responder'::"text"])))
);


ALTER TABLE "public"."call_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."emergency_responders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "phone_number" "text" NOT NULL,
    "service_type" "text" NOT NULL,
    "name" "text",
    "location_lat" numeric,
    "location_lng" numeric,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "station_address" "text",
    CONSTRAINT "emergency_responders_service_type_check" CHECK (("service_type" = ANY (ARRAY['fire'::"text", 'medical'::"text", 'police'::"text"])))
);


ALTER TABLE "public"."emergency_responders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."incidents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_phone_number" "text" NOT NULL,
    "responder_phone_number" "text",
    "service_type" "text" NOT NULL,
    "location_lat" numeric NOT NULL,
    "location_lng" numeric NOT NULL,
    "location_address" "text",
    "video_url" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "detected_at" timestamp with time zone DEFAULT "now"(),
    "assigned_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "incidents_service_type_check" CHECK (("service_type" = ANY (ARRAY['fire'::"text", 'medical'::"text", 'police'::"text"]))),
    CONSTRAINT "incidents_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'assigned'::"text", 'in_progress'::"text", 'resolved'::"text"])))
);


ALTER TABLE "public"."incidents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipient_phone" "text",
    "message_body" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."video_calls" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "incident_id" "text" NOT NULL,
    "caller_phone" "text" NOT NULL,
    "responder_phone" "text" NOT NULL,
    "status" "text" DEFAULT 'initiating'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "connected_at" timestamp with time zone,
    "ended_at" timestamp with time zone,
    "call_type" "text" DEFAULT 'emergency'::"text",
    CONSTRAINT "video_calls_call_type_check" CHECK (("call_type" = ANY (ARRAY['emergency'::"text", 'followup'::"text"]))),
    CONSTRAINT "video_calls_status_check" CHECK (("status" = ANY (ARRAY['initiating'::"text", 'ringing'::"text", 'connected'::"text", 'ended'::"text"])))
);


ALTER TABLE "public"."video_calls" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webrtc_signals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "call_id" "uuid" NOT NULL,
    "from_phone" "text" NOT NULL,
    "to_phone" "text" NOT NULL,
    "signal_type" "text" NOT NULL,
    "signal_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "webrtc_signals_signal_type_check" CHECK (("signal_type" = ANY (ARRAY['offer'::"text", 'answer'::"text", 'ice_candidate'::"text"])))
);


ALTER TABLE "public"."webrtc_signals" OWNER TO "postgres";


ALTER TABLE ONLY "public"."call_participants"
    ADD CONSTRAINT "call_participants_call_id_phone_number_key" UNIQUE ("call_id", "phone_number");



ALTER TABLE ONLY "public"."call_participants"
    ADD CONSTRAINT "call_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."emergency_responders"
    ADD CONSTRAINT "emergency_responders_phone_number_key" UNIQUE ("phone_number");



ALTER TABLE ONLY "public"."emergency_responders"
    ADD CONSTRAINT "emergency_responders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."incidents"
    ADD CONSTRAINT "incidents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."video_calls"
    ADD CONSTRAINT "video_calls_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webrtc_signals"
    ADD CONSTRAINT "webrtc_signals_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_call_participants_call_id" ON "public"."call_participants" USING "btree" ("call_id");



CREATE INDEX "idx_incidents_responder_phone" ON "public"."incidents" USING "btree" ("responder_phone_number");



CREATE INDEX "idx_incidents_service_type" ON "public"."incidents" USING "btree" ("service_type");



CREATE INDEX "idx_incidents_status" ON "public"."incidents" USING "btree" ("status");



CREATE INDEX "idx_incidents_user_phone" ON "public"."incidents" USING "btree" ("user_phone_number");



CREATE INDEX "idx_responders_active" ON "public"."emergency_responders" USING "btree" ("is_active");



CREATE INDEX "idx_responders_service_type" ON "public"."emergency_responders" USING "btree" ("service_type");



CREATE INDEX "idx_video_calls_incident_id" ON "public"."video_calls" USING "btree" ("incident_id");



CREATE INDEX "idx_video_calls_status" ON "public"."video_calls" USING "btree" ("status");



CREATE INDEX "idx_webrtc_signals_call_id" ON "public"."webrtc_signals" USING "btree" ("call_id");



CREATE INDEX "idx_webrtc_signals_to_phone" ON "public"."webrtc_signals" USING "btree" ("to_phone");



ALTER TABLE ONLY "public"."call_participants"
    ADD CONSTRAINT "call_participants_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "public"."video_calls"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."webrtc_signals"
    ADD CONSTRAINT "webrtc_signals_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "public"."video_calls"("id") ON DELETE CASCADE;



CREATE POLICY "Users can create calls they're initiating" ON "public"."video_calls" FOR INSERT WITH CHECK (("caller_phone" = "current_setting"('app.current_user_phone'::"text")));



CREATE POLICY "Users can join calls they're involved in" ON "public"."call_participants" FOR INSERT WITH CHECK (("call_id" IN ( SELECT "video_calls"."id"
   FROM "public"."video_calls"
  WHERE (("video_calls"."caller_phone" = "current_setting"('app.current_user_phone'::"text")) OR ("video_calls"."responder_phone" = "current_setting"('app.current_user_phone'::"text"))))));



CREATE POLICY "Users can send signals from themselves" ON "public"."webrtc_signals" FOR INSERT WITH CHECK (("from_phone" = "current_setting"('app.current_user_phone'::"text")));



CREATE POLICY "Users can update calls they're involved in" ON "public"."video_calls" FOR UPDATE USING ((("caller_phone" = "current_setting"('app.current_user_phone'::"text")) OR ("responder_phone" = "current_setting"('app.current_user_phone'::"text"))));



CREATE POLICY "Users can update their own participation" ON "public"."call_participants" FOR UPDATE USING (("phone_number" = "current_setting"('app.current_user_phone'::"text")));



CREATE POLICY "Users can view calls they're involved in" ON "public"."video_calls" FOR SELECT USING ((("caller_phone" = "current_setting"('app.current_user_phone'::"text")) OR ("responder_phone" = "current_setting"('app.current_user_phone'::"text"))));



CREATE POLICY "Users can view participants in their calls" ON "public"."call_participants" FOR SELECT USING (("call_id" IN ( SELECT "video_calls"."id"
   FROM "public"."video_calls"
  WHERE (("video_calls"."caller_phone" = "current_setting"('app.current_user_phone'::"text")) OR ("video_calls"."responder_phone" = "current_setting"('app.current_user_phone'::"text"))))));



CREATE POLICY "Users can view signals sent to them" ON "public"."webrtc_signals" FOR SELECT USING (("to_phone" = "current_setting"('app.current_user_phone'::"text")));



ALTER TABLE "public"."call_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."video_calls" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webrtc_signals" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."call_participants" TO "anon";
GRANT ALL ON TABLE "public"."call_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."call_participants" TO "service_role";



GRANT ALL ON TABLE "public"."emergency_responders" TO "anon";
GRANT ALL ON TABLE "public"."emergency_responders" TO "authenticated";
GRANT ALL ON TABLE "public"."emergency_responders" TO "service_role";



GRANT ALL ON TABLE "public"."incidents" TO "anon";
GRANT ALL ON TABLE "public"."incidents" TO "authenticated";
GRANT ALL ON TABLE "public"."incidents" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON TABLE "public"."video_calls" TO "anon";
GRANT ALL ON TABLE "public"."video_calls" TO "authenticated";
GRANT ALL ON TABLE "public"."video_calls" TO "service_role";



GRANT ALL ON TABLE "public"."webrtc_signals" TO "anon";
GRANT ALL ON TABLE "public"."webrtc_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."webrtc_signals" TO "service_role";









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
































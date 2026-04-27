"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface RealtimeConfig {
    table: string;
    filter?: string;
    onInsert?: (payload: any) => void;
    onUpdate?: (payload: any) => void;
    onDelete?: (payload: any) => void;
    enabled?: boolean;
}

// Singleton client untuk menghindari pembuatan banyak instance di browser
let supabaseBrowserClient: any = null;

export function useRealtime({
    table,
    filter,
    onInsert,
    onUpdate,
    onDelete,
    enabled = true,
}: RealtimeConfig) {
    if (!supabaseBrowserClient) {
        supabaseBrowserClient = createClient();
    }
    const supabase = supabaseBrowserClient;
    const channelRef = useRef<any>(null);

    // Keep track of the latest callbacks to avoid stale closures
    const onInsertRef = useRef(onInsert);
    const onUpdateRef = useRef(onUpdate);
    const onDeleteRef = useRef(onDelete);

    useEffect(() => {
        onInsertRef.current = onInsert;
        onUpdateRef.current = onUpdate;
        onDeleteRef.current = onDelete;
    }, [onInsert, onUpdate, onDelete]);

    useEffect(() => {
        if (!enabled) {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
            return;
        }

        const channelName = `realtime-${table}-${filter ?? "all"}`;
        // ... (rest of the setup)
        let realtimeConfig: any = {
            event: "*",
            schema: "public",
            table,
        };

        if (filter) {
            realtimeConfig.filter = filter;
        }

        channelRef.current = supabase
            .channel(channelName)
            .on("postgres_changes", realtimeConfig, (payload: any) => {
                console.log(`[REALTIME DEBUG] Table: ${table} | Event: ${payload.eventType}`, payload);
                if (payload.eventType === "INSERT" && onInsertRef.current) {
                    onInsertRef.current(payload.new);
                }
                if (payload.eventType === "UPDATE" && onUpdateRef.current) {
                    onUpdateRef.current(payload.new);
                }
                if (payload.eventType === "DELETE" && onDeleteRef.current) {
                    onDeleteRef.current(payload.old);
                }
            })
            .subscribe((status: any) => {
                console.log(`[REALTIME DEBUG] Subscribe status for ${channelName}: ${status}`);
            });

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [table, filter, enabled]);
}
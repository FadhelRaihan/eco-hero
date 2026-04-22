"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface RealtimeConfig {
    table: string;
    filter?: string;        // contoh: "class_id=eq.abc123"
    onInsert?: (payload: any) => void;
    onUpdate?: (payload: any) => void;
    onDelete?: (payload: any) => void;
}

export function useRealtime({
    table,
    filter,
    onInsert,
    onUpdate,
    onDelete,
}: RealtimeConfig) {
    const supabase = createClient();
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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
        const channelName = `realtime-${table}-${filter ?? "all"}`;

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
            .on("postgres_changes", realtimeConfig, (payload) => {
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
            .subscribe((status) => {
                console.log(`[REALTIME DEBUG] Subscribe status for ${channelName}: ${status}`);
            });

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [table, filter]);
}
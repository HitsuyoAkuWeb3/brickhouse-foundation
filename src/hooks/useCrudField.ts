import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface CrudFieldOptions {
  tableName: string;
  queryKey: unknown[];
  pkColumn?: string;
  isInsertOnly?: boolean;
  userIdColumn?: string;
}

export function useCrudField<T extends { id?: string | number; user_id?: string; [key: string]: any }>(
  options: CrudFieldOptions
) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async (payload: { id?: string | number; action?: 'delete'; updates?: Partial<T>; insertAppend?: Record<string, any> }) => {
      if (!user) throw new Error("Not authenticated");

      if (payload.action === 'delete' && payload.id) {
        const { error } = await (supabase as any)
          .from(options.tableName)
          .delete()
          .eq(options.pkColumn || "id", payload.id);
        if (error) throw error;
        return { deletedId: payload.id };
      }

      // Ensure updated_at is handled by DB triggers, or we can send it explicitly if needed
      // To keep it simple, we'll let supabase handle default timestamps if not provided,
      // but we inject it for updates just in case the table expects it. 
      // (Some tables like passion_picks have updated_at)
      
      const updateData = { ...payload.updates };
      // Try to gracefully add updated_at if it's an update
      if (payload.id && !options.isInsertOnly) {
         (updateData as any).updated_at = new Date().toISOString();
      }

      if (payload.id && !options.isInsertOnly) {
        const { error, data } = await (supabase as any)
          .from(options.tableName)
          .update(updateData)
          .eq(options.pkColumn || "id", payload.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const insertData = { 
          [options.userIdColumn || "user_id"]: user.id, 
          ...(payload.insertAppend || {}),
          ...payload.updates 
        };
        const { error, data } = await (supabase as any)
          .from(options.tableName)
          .insert(insertData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: options.queryKey });
      const previousData = queryClient.getQueryData<T | T[]>(options.queryKey);

      if (Array.isArray(previousData)) {
        if (payload.action === 'delete') {
          queryClient.setQueryData(
            options.queryKey,
            previousData.filter((item) => item.id !== payload.id)
          );
        } else if (payload.id && !options.isInsertOnly) {
          queryClient.setQueryData(
            options.queryKey,
            previousData.map((item) =>
              item.id === payload.id ? { ...item, ...payload.updates } : item
            )
          );
        } else {
          // Optimistic insert
          const tempId = `temp-${Date.now()}`;
          queryClient.setQueryData(
            options.queryKey,
            [{ id: tempId, user_id: user?.id, ...payload.updates } as unknown as T, ...previousData]
          );
        }
      } else if (previousData && typeof previousData === 'object') {
        if (payload.action !== 'delete') {
          queryClient.setQueryData(options.queryKey, {
            ...previousData,
            ...payload.updates,
          });
        }
      } else {
        // No previous data (e.g. empty single record)
        if (payload.action !== 'delete') {
          const tempId = `temp-${Date.now()}`;
          queryClient.setQueryData(options.queryKey, { id: tempId, user_id: user?.id, ...payload.updates });
        }
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      console.error(`Error mutating ${options.tableName}:`, err);
      queryClient.setQueryData(options.queryKey, context?.previousData);
      toast.error("Failed to save changes.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: options.queryKey });
    },
  });

  return mutation;
}

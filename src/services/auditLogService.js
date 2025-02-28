import supabase from "../Lib/supabase";

export const logAction = async (userId, action, details) => {
  const { error } = await supabase
    .from("audit_logs")
    .insert([{ user_id: userId, action, details }]);

  if (error) console.error("Error logging action:", error);
};
import { supabase } from '../../supabase'; // Try adding .ts if this still shows red

const handleSaveSMS = async (phoneNumber: string, content: string) => {
  try {
    // 1. Find or Create the Conversation (Thread)
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .upsert(
        { phone_number: phoneNumber, last_message: content }, 
        { onConflict: 'phone_number' }
      )
      .select()
      .single();

    if (convError) throw convError;

    // 2. Save the actual message linked to that conversation ID
    const { error: msgError } = await supabase
      .from('messages')
      .insert([
        { 
          conversation_id: conv.id, 
          content: content, 
          sender: 'incoming' 
        }
      ]);

    if (msgError) throw msgError;

    console.log("Conversation updated and message saved!");
  } catch (err: any) { 
    // Using ': any' is the quickest fix for the 'unknown' error, 
    // though 'instanceof Error' is the "cleaner" TypeScript way.
    console.error("Save Error:", err.message || err);
  }
};
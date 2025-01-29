import supabase from "./supabasescript";

export const analytics = {
  logEvent: async (eventName: string, data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('analytics')
        .insert([{
          event: eventName,
          data,
          user_id: user?.id,
          timestamp: new Date()
        }]);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }
};
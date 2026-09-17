import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sauovgdyrcwujulkbdnh.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ypDT2VOzdJVGWChtML3x_g_StR9YILp';

export const supabase = createClient(supabaseUrl, supabaseKey);

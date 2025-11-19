import { createClient } from "@supabase/supabase-js";
import { UserInterface, UserDataInterface } from "./Interfaces";

const SUPABASE_URL = "https://hopvgsttpmoofwlxhkbx.supabase.co";
const SUPABASE_KEY = "sb_publishable_1TvVZv76Cmle6-R_J8b08g_55S7cK5C";

const Supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const getUserDetails = async (): Promise<UserInterface|null> => {
    const {data: {session}, error: authError} = await Supabase.auth.getSession();
    if(authError || !session)
    {
        if(authError) {
            console.error("error retreiving session");
            console.error(authError);
        }
        return null;
    }
    
    
    const {data, error} = await Supabase.rpc('get_user_data', {uid:session.user.id}).maybeSingle();
    const userData_: UserDataInterface | null = data as UserDataInterface | null;
    if(userData_)
    {
        if(userData_.latitude) {
            const userData: UserInterface = {
                id: userData_!.user_id,
                name: userData_!.name,
                email: session!.user.email!,
                location: {
                    latitude: userData_!.latitude,
                    longitude: userData_!.longitude!
                },
                role: userData_!.role
            };
            return userData;
        }
        else {
            const userData: UserInterface = {
                id: userData_!.user_id,
                name: userData_!.name,
                email: session!.user.email!,
                location: null,
                role: userData_!.role
            };
            return userData;
        }
    }
    else
    {
        console.error("error retreiving user data");
        console.error(error);
        return null;
    }
};

export default Supabase;
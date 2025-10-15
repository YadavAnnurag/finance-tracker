import {  createContext, useContext,useEffect, useState } from "react";
import {supabase} from '../supabaseClient';
import  axios  from "axios";
import { API_URL } from '../config';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children}) => {
  const [user, setUser] = useState(null);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    //check active session
    supabase.auth.getSession().then(({data: {session}}) => {
      setUser(session?.user ?? null);
      setloading(false);
    });
    //listen of auth changes
    const { data: {subscription }} = supabase.auth.onAuthStateChange(
      async(_event,session) => {
        setUser(session?.user ?? null);

        //Create user in our database if they don't exist
        if(session?.user){
          await createUserInDatabase(session.user);
        }
      }
    );
    return () => subscription.unsubscribe();
  },[]);
  const createUserInDatabase = async (authUser) => {
    try{
      await axios.post(`${API_URL}/api/users`,{
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email.split('@')[0]
      });
    }catch (error){
      //user might already exist
      console.log('User already exist in the database');
    }
  };

  const signUp = async(email,password,name) => {
    const{data ,error} = await supabase.auth.signUp({
      email,
      password,
      Options: {
        data: {
          name: name
        }
      }
    });

    if(error) throw error;
    return data;
  };
    const signIn = async (email,password) => {
      const {data,error} = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    };

    const signOut = async () => {
      const {error} = await supabase.auth.signOut();
      if(error) throw error;
    };
    const value = {
      user,
      signUp,
      signIn,
      signOut,
      loading
    };

    return(
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
    );
  } ;

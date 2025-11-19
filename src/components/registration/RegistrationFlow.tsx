import React, { useEffect, useState } from 'react';
import Step1 from './RegistrationStep1';
import Step2 from './RegistrationStep2';
import Step3 from './RegistrationStep3';

import Supabase from '../../utils/Database';
import { useNavigate } from 'react-router-dom';

const RegistrationFlow = () => {
  const [step, setStep] = useState(1);
  const [OAuthSignup, setOAuthSignup] = useState(false);
  interface formDataInterface {
    email: string, password: string, role: "Customer"|"Retailer"|"Wholesaler", name:string, latitude:number|null, longitude:number|null
  }
  const [formData, setFormData] = useState<formDataInterface>({
    email: '',
    password: '',
    role: 'Customer',
    name: '',
    latitude: null,
    longitude: null
  });
  const nav = useNavigate();

  useEffect(()=>{
    const getUserData = async () => {
      const {data: {session}, error} = await Supabase.auth.getSession();
      if(session) {
        const {data, error} = await Supabase.from("users").select().match({user_id: session.user.id}).maybeSingle();
        if(data) {
          console.error("user already created");
          nav('/');
        }
        else {
          setOAuthSignup(true);
          setStep(2);
          setFormData({...formData, name:session.user.user_metadata.name});
        }
      }
    };
    getUserData();
  }, [step]);

  const handleNextStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep(step + 1);
  };
  const handlePreviousStep = () => {
    setStep(step - 1);
  };
  const handleFormDataChange = (data: { [key: string]: string }) => {
    setFormData({ ...formData, ...data });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>
  {
    console.log(formData);
    e.preventDefault();
    if(!OAuthSignup) {
      const {data, error} = await Supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options:{data:{...formData, role: formData.role.toLowerCase()}}
      });
      if(!error) {
          setStep(step+1);
          const {data, error} = await Supabase.auth.signInWithOtp({email: formData.email,
            options:{emailRedirectTo: 'https://localhost:5173'}});
          console.log('User created');
      }
    }
    else {
      const {data, error} = await Supabase.auth.updateUser({data:{...formData, role: formData.role.toLowerCase()}});
      console.log(data);
      if(error){
        console.log(error);
      }
      else{
        nav('/');
        console.log('User created');
      }
    }
  }
  return (
    <div>
      {step === 1 && <Step1 onNext={(e)=>{handleNextStep(e)}} onChange={handleFormDataChange} initialFormData={formData}/>}
      {step === 2 && <Step2 onNext={(e)=>{handleSubmit(e)}} onPrev={handlePreviousStep} onChange={handleFormDataChange} initialFormData={formData}/>}
      {step === 3 && <Step3/>}
    </div>
  );
};

export default RegistrationFlow;
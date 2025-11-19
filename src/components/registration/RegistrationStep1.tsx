import React, { useState, ChangeEvent, MouseEventHandler } from 'react';
import Supabase from '../../utils/Database';
import TextDivider from '../TextDivider';

interface Step1Props {
    onNext: (e:React.FormEvent<HTMLFormElement>) => void;
    onChange: (data: {[key: string]:string}) => void;
    initialFormData: {email: string, password: string};
}

const Step1 = ({ onNext, onChange , initialFormData}:Step1Props) => {
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value});
        onChange({[name]: value});
    };

    const handle3rdPartyLogin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const fetchUserData = async () => {
            const {data, error} = await Supabase.auth.signInWithOAuth({provider:"google", options:{redirectTo:"http://localhost:5173/register"}});
            if(error) {console.error("Sign in failed: ",error);}
        }
        fetchUserData();
    }

    return (
        <form className="register-form step1" onSubmit={onNext}>
            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleChange(e)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(e)=>handleChange(e)}
                    required
                    minLength={6}
                />
            </div>
            <div className="navigation">
                <button type="submit" className="next">Get Started</button>
            </div>
            <TextDivider text='or' textColor='#000' lineColor='#000'/>
            <div className="navigation OAuth">
                <button type="button" className="next google" onClick={handle3rdPartyLogin}>Continue with Google</button>
            </div>
        </form>
    );
};

export default Step1;
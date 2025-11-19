import React, { useState, ChangeEvent } from 'react';

interface Step2Props {
    onNext: (e:React.FormEvent<HTMLFormElement>) => void;
    onPrev: () => void;
    onChange: (data: {[key: string]:string}) => void;
    initialFormData: {role: "Customer"|"Retailer"|"Wholesaler", name: string, latitude: number|null, longitude: number|null};
}

const Step2 = ({ onNext, onPrev, onChange, initialFormData }:Step2Props) => {
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value});
        onChange({[name]: value});
    };

    const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value});
        onChange({[name]: value});
    };

    const handleCurrentLocation = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setFormData({...formData, latitude:latitude, longitude:longitude}); 
                    onChange({"latitude": String(latitude), "longitude": String(longitude)});
                },
                (error) => {
                    console.error("Error getting current location: ", error);
                }
            )
        } else {
            console.error("Geolocation not supported");
        }
    }

    return (
        <form className="register-form step1" onSubmit={onNext}>
            <div className="form-group">
                <label htmlFor="role">Register as:</label>
                <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={(e)=>handleSelect(e)}
                >
                    <option value="Customer">Customer</option>
                    <option value="Retailer">Retailer</option>
                    <option value="Wholesaler">Wholesaler</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="name">{(formData.role!='Customer')?(formData.role+' name:'):'Name'}</label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange(e)}
                    required
                />
            </div>
            {/* Handle getting location using google api later */}
            {(formData.role!='Customer')&&
            <>
            <div className="form-group">
                <button onClick={handleCurrentLocation}>Get current location</button>
            </div>
            <div className="form-group">
                <label htmlFor="latitude">Latitude:</label>
                {formData.latitude?
                <input
                    id="latitude"
                    type="number"
                    step={0.000001}
                    name="latitude" 
                    value={formData.latitude}
                    onChange={(e) => handleChange(e)}
                    required
                />
                :
                <input
                    id="latitude"
                    type="number"
                    step={0.000001}
                    name="latitude" 
                    onChange={(e) => handleChange(e)}
                    required
                />}
            </div>
            <div className="form-group">
                <label htmlFor="longitude">Longitude:</label>
                {formData.longitude?
                <input
                    id="longitude"
                    type="number"
                    step={0.000001}
                    name="longitude" 
                    value={formData.longitude}
                    onChange={(e) => handleChange(e)}
                    required
                />
                :<input
                    id="longitude"
                    type="number"
                    step={0.000001}
                    name="longitude" 
                    onChange={(e) => handleChange(e)}
                    required
                />
                }
            </div>
            </>
            }
            <div className="navigation">
                <button onClick={onPrev} className="prev">Back</button>
                <button type="submit" className="next submit-btn">Submit</button>
            </div>
        </form>
    );
};

export default Step2;
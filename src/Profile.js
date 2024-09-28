import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import 'font-awesome/css/font-awesome.min.css';
import { fetchUser, updateUserDetails } from './services/apiService';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        city: '',
        avatar: '' // Avatar state
    });
    const [avatarPreview, setAvatarPreview] = useState(''); // State for avatar preview
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUser().then(response => {
            const data = response.data || {};
            const nameParts = (data.name || '').split(' ', 2);
            const first_name = nameParts[0] || '';
            const last_name = nameParts[1] || '';
    
            setUser({
                first_name,
                last_name,
                email: data.email || '',
                phone_number: data.phone_number || '',
                city: data.city || '',
                // Use string interpolation to include the `/storage/` prefix
                avatar: `https://api.ica.amigosserver.com/storage/${data.avatar || ''}` 
            });
            // Set the avatar preview with the updated URL
            setAvatarPreview(`https://api.ica.amigosserver.com/storage/${data.avatar || '/default-avatar.png'}`); 
        }).catch(error => {
            console.error("Error fetching user data:", error);
        });
    }, []);    

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUser({ ...user, avatar: file }); // Update avatar state with the file
            setAvatarPreview(URL.createObjectURL(file)); // Preview the selected image
        }
    };

    const handleSaveChanges = () => {
        const formData = new FormData();
        formData.append('first_name', user.first_name);
        formData.append('last_name', user.last_name);
        formData.append('email', user.email);
        formData.append('phone_number', user.phone_number);
        formData.append('city', user.city);
        if (user.avatar instanceof File) {
            formData.append('avatar', user.avatar); // Append avatar to form data if it's a file
        }

        updateUserDetails(formData)
            .then(response => {
                setShowModal(true);
            })
            .catch(error => {
                console.error('Error updating user details:', error);
                alert('Error updating user details');
            });
    };

    const handleCloseModal = () => {
        setShowModal(false);
        window.location.reload();
    };

    const handleBackClick = () => {
        navigate('/portfolios');
    };

    return (
        <div className="main_menu_wrapper">
            <div className='container'>
                <div className='d-flex justify-content-between'>
                    <div className='backbtn'>
                        <button onClick={handleBackClick}>
                            <i className="fa fa-arrow-left"></i>
                        </button>
                    </div>
                    <div>
                        <h5 className="black-text">EDIT PROFILE</h5>
                    </div>
                </div>            
                <div className="profile-form bg-white p-4 mt-4 rounded">
                    <form className="form-content">
                        {/* Avatar Upload and Preview */}
                        <div className="form-group text-center mt-4">
                            <label htmlFor="avatar" className="d-block position-relative">
                                <img 
                                    src={avatarPreview}
                                    alt="Avatar Preview"
                                    className="avatar-preview rounded-circle" // Add any custom styling you want
                                    style={{ width: '150px', height: '150px' }} // Size of the preview image
                                />
                                {/* Edit icon on top of the avatar */}
                                <i 
                                    className="fa fa-edit edit-icon" 
                                    onClick={() => document.getElementById('avatar').click()} 
                                    style={{ position: 'absolute', bottom: '10px', right: '10px', cursor: 'pointer', fontSize: '20px', color: '#000', backgroundColor: '#eeee', borderRadius: '50%', padding: '5px' }} 
                                ></i>
                            </label>
                            <input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="d-none" // Hide the file input
                            />
                        </div>

                        {/* Other input fields */}
                        <div className="form-group mt-4">
                            <div className="input-container">
                                <i className="fa fa-user icon"></i>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="First Name"
                                    value={user.first_name}
                                    onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group mt-4">
                            <div className="input-container">
                                <i className="fa fa-user icon"></i>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Last Name"
                                    value={user.last_name}
                                    onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group mt-4">
                            <div className="input-container">
                                <i className="fa fa-envelope icon"></i>
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="Email"
                                    value={user.email}
                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group mt-4">
                            <div className="input-container">
                                <i className="fa fa-phone icon"></i>
                                <input
                                    type="tel"
                                    className="input-field"
                                    placeholder="+1234567890"
                                    value={user.phone_number}
                                    onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group mt-4">
                            <div className="input-container">
                                <i className="fa fa-map-marker icon"></i>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="City"
                                    value={user.city}
                                    onChange={(e) => setUser({ ...user, city: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            className="savebtn btn-danger btn-block mt-4"
                            onClick={handleSaveChanges}
                        >
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Bootstrap Modal */}
                <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} role="dialog" aria-labelledby="successModalLabel" aria-hidden={!showModal}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="successModalLabel">Success</h5>
                            </div>
                            <div className="modal-body">
                                User details updated successfully!
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

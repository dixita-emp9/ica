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
        avatar: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);

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
                avatar: data.avatar || ''
            });

            // Update avatar preview if an avatar exists
            if (data.avatar) {
                setAvatarPreview(data.avatar); // Directly set the avatar URL
            }
        }).catch(error => {
            console.error("Error fetching user data:", error);
        });
    }, []);

    const handleSaveChanges = () => {
        const formData = new FormData();
        formData.append('first_name', user.first_name);
        formData.append('last_name', user.last_name);
        formData.append('email', user.email);
        formData.append('phone_number', user.phone_number);
        formData.append('city', user.city);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        updateUserDetails(formData)
            .then(response => {
                setShowModal(true);
                // Optionally update the avatar preview after upload
                if (avatarFile) {
                    setAvatarPreview(URL.createObjectURL(avatarFile));
                }
            })
            .catch(error => {
                console.error('Error updating user details:', error);
                alert('Error updating user details');
            });
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleBackClick = () => {
        navigate('/portfolios');
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
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
                    {avatarPreview ? (
                            <div className="avatar-preview-container">
                                <img src={avatarPreview} alt="Avatar Preview" className="avatar-preview" />
                            </div>
                        ) : (
                            <div className="avatar-placeholder">No Image</div>
                        )}
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

                        <div className="form-group mt-4">
                            <div className="input-container">
                                <i className="fa fa-image icon"></i>
                                <input
                                    type="file"
                                    className="input-field"
                                    onChange={handleAvatarChange}
                                    accept="image/*" // Only accept images
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

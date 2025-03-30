import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import '../styles/Profile.css';
import { Modal, Button } from 'react-bootstrap';
import moment from 'moment';
import { getUserById, updateField } from '../api/userAPI';
import Footer from '../components/common/Footer';

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    birthday: '',
    provider: 'email',
    role: '',
    pen_name: '',
    created_at: '',
    password: 'created' // Set to 'created' or undefined based on your logic
  });

  // Modal states
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentField, setCurrentField] = useState('');
  const [currentType, setCurrentType] = useState('');
  const [textInputValue, setTextInputValue] = useState('');
  const [datePickerValue, setDatePickerValue] = useState(null);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const userId = localStorage.getItem('userId') || '12345';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
       const userData = await getUserById(userId);
        const mockUserData = {
          id: userId,
          name: userData.name || 'John Doe',
          email: userData.email || 'john@example.com',
          birthday: '01/01/1990',
          provider: userData.provider || 'email',
          role: 'user', 
          pen_name: 'J. Doe',
          created_at: userData.createAt,
          password: 'created'
        };
        
        setUserData(mockUserData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load user profile'
        });
      }
    };
    
    fetchUserData();
  }, []);

  // Format date functions
  const formatLongDate = (dateString) => {
    if (!dateString) return 'Not set';
    return moment(dateString).format('MMMM D, YYYY');
  };

  // Modal handlers
  const openDateModal = (title, fieldId) => {
    setModalTitle(title);
    setCurrentField(fieldId);
    setShowDateModal(true);
  };

  const openTextModal = (title, fieldId, type) => {
    setModalTitle(title);
    setCurrentField(fieldId);
    setCurrentType(type);
    setTextInputValue(userData[type] || '');
    setShowTextModal(true);
  };

  const openPasswordModal = () => {
    setShowPasswordModal(true);
  };

  // Form submission handlers
  const saveBirthday = async () => {
    if (!datePickerValue) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select a date'
      });
      return;
    }

    const formattedDate = moment(datePickerValue[0]).format('DD/MM/YYYY');
    const today = moment();

    if (moment(formattedDate, 'DD/MM/YYYY').isAfter(today)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select a valid date'
      });
      return;
    }

    try {

      // const response = await fetch('/api/user/update-birthday', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     birthday: formattedDate
      //   })
      // });
      // const data = await response.json();
      
      // Mock successful response
      setUserData({
        ...userData,
        birthday: formattedDate
      });
      
      setShowDateModal(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Birthday updated successfully'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update birthday'
      });
    }
  };

  const saveTextChange = async () => {
    if (!textInputValue.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter a value'
      });
      return;
    }

    // Validate based on type
    if (currentType === 'email' && !isValidEmail(textInputValue)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter a valid email'
      });
      return;
    } else if (currentType === 'name' && textInputValue.length < 2) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Name must be at least 2 characters'
      });
      return;
    }

    try {
     
      const data = {
        userId : userId,
        fieldName: currentField,
        fieldValue: textInputValue
      }



      const response = await updateField(data);

  
      setUserData({
        ...userData,
        [currentType]: textInputValue
      });
      
      setShowTextModal(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Updated successfully'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update'
      });
    }
  };

  const savePassword = async () => {
    // Validate empty fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'All fields are required'
      });
      return;
    }

    // Check password match
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'New passwords do not match'
      });
      return;
    }

    try {
      // Replace with your actual API endpoint
      // const response = await fetch('/api/user/update-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     currentPassword,
      //     newPassword
      //   })
      // });
      // const data = await response.json();
      
      // Mock successful response
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Password updated successfully'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Current password is incorrect'
      });
    }
  };

  // Utility functions
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="profile">
      <div className="container">
        {/* Greeting Section */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-light mb-5">
          <Link className="navbar-brand" to="/">
            <h3>Quizz</h3>
          </Link>
        </nav>
        
        <div className="mb-4">
          <h1 className="fw-bold">Your Account</h1>
          <p className="text-muted">
            You've been using Quizz since {formatLongDate(userData.created_at)}.
          </p>
        </div>

        <hr className="section-divider" />

        {/* Account Information */}
        <div>
          <h2 className="account-title mb-3">Account information</h2>
          
          <div className="row mb-2">
            <div className="col-4">Account number</div>
            <div className="col-8 value">{userData.id}</div>
          </div>
          
          <div className="row mb-2">
            <div className="col-4">User name</div>
            <div className="col-6 value" id="name">
              {userData.name}
            </div>
            <div className="col-2">
              <button
                className="btn btn-outline-dark"
                onClick={() => openTextModal('Update User name', 'name', 'name')}
              >
                Update
              </button>
            </div>
          </div>
          
          <div className="row mb-2">
            <div className="col-4">Email address</div>
            <div className="col-6 value" id="email">
              {userData.email}
            </div>
            <div className="col-2">
              <button
                className="btn btn-outline-dark"
                onClick={() => openTextModal('Update Email', 'email', 'email')}
                disabled={userData.provider === 'google'}
              >
                Update
              </button>
            </div>
          </div>
          
          <div className="row mb-2">
            <div className="col-4">Password</div>
            <div className="col-6 value">
              {userData.password ? 'Created' : 'None'}
            </div>
            <div className="col-2">
              {userData.password && (
                <button
                  className="btn btn-outline-dark"
                  onClick={openPasswordModal}
                >
                  Update
                </button>
              )}
            </div>
          </div>
          
          <div className="row mb-2">
            <div className="col-4">Birthday</div>
            <div className="col-6 value" id="dob">
              {formatLongDate(userData.birthday)}
            </div>
            <div className="col-2">
              <button
                onClick={() => openDateModal('Date of birth', 'dob')}
                className="btn btn-outline-dark"
              >
                Update
              </button>
            </div>
          </div>
          
          <div className="row mb-2">
            <div className="col-4">Connected accounts</div>
            <div className="col-8 value">
              {userData.provider === 'email'
                ? 'Created with your email'
                : userData.provider.toUpperCase()}
            </div>
          </div>
        </div>

        <hr className="section-divider" />

        {/* Profile Section */}
        <div>
          <h2 className="account-title mb-3">Check your quiz-taking history</h2>
          <div className="row mb-2">
            <div className="col-4">Go to the history page by clicking the button</div>
            <div className="col-6 value"></div>
            <div className="col-2">
              <Link className="btn btn-outline-dark" to="/history">
                Subscribe
              </Link>
            </div>
          </div>
        </div>
        
       
      </div>
      <Footer/>
      {/* Date Picker Modal */}
      <Modal show={showDateModal} onHide={() => setShowDateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Flatpickr
            className="form-control"
            placeholder="Click to select a date"
            options={{
              enableTime: false,
              dateFormat: 'd/m/Y',
              defaultDate: userData.birthday ? new Date(moment(userData.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD')) : new Date()
            }}
            onChange={date => setDatePickerValue(date)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDateModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={saveBirthday}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Text Input Modal */}
      <Modal show={showTextModal} onHide={() => setShowTextModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            id="text-input"
            className="form-control"
            placeholder="Enter new value"
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTextModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={saveTextChange}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Password Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <small className="text-muted">
              Must be at least 8 characters with numbers and letters
            </small>
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={savePassword}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfilePage;
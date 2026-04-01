import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Notification from '../components/Notifications';

function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchContact();
    fetchCompanies();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchContact = async () => {
    try {
      const response = await api.get(`/contacts/${id}`);
      setContact(response.data);
      setFormData({
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: response.data.email || '',
        phone: response.data.phone || '',
        role: response.data.role || '',
        company_id: response.data.company_id ? response.data.company_id.toString() : '',
      });
    } catch (error) {
      console.error('Error loading contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email';
    }
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      errors.phone = 'Invalid phone format';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      const dataToSend = {
        ...formData,
        company_id: formData.company_id ? parseInt(formData.company_id) : null,
      };
      await api.put(`/contacts/${id}`, dataToSend);
      setNotification({ message: 'Contact updated successfully!', type: 'success' });
      setEditing(false);
      fetchContact();
    } catch {
      setNotification({ message: 'Error saving changes', type: 'error' });
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email || '',
      phone: contact.phone || '',
      role: contact.role || '',
      company_id: contact.company_id ? contact.company_id.toString() : '',
    });
    setFormErrors({});
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[50vh]">
        <div className="text-slate-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500 text-lg">Contact not found.</p>
        <button
          onClick={() => navigate('/contacts')}
          className="mt-4 text-slate-800 font-semibold hover:underline"
        >
          ← Back to Contacts
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <button
        onClick={() => navigate('/contacts')}
        className="text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 inline-flex items-center gap-1 transition-colors"
      >
        ← Back to Contacts
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {contact.first_name} {contact.last_name}
            </h1>
            {contact.company_name && (
              <p className="text-slate-500 mt-1">{contact.company_name}</p>
            )}
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-slate-800 text-white px-4 py-2 rounded-xl hover:bg-slate-700 transition-all text-sm font-medium"
            >
              Edit
            </button>
          )}
        </div>

        <div className="p-6">
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all bg-slate-50 ${
                      formErrors.first_name ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all bg-slate-50 ${
                      formErrors.last_name ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.last_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all bg-slate-50 ${
                      formErrors.email ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all bg-slate-50 ${
                      formErrors.phone ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all bg-slate-50"
                    placeholder="e.g. Director, Manager..."
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-2">
                    Company
                  </label>
                  <select
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all bg-slate-50"
                  >
                    <option value="">No company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="bg-slate-800 text-white px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-all text-sm font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">First Name</p>
                <p className="text-slate-800 mt-1 font-medium">{contact.first_name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Name</p>
                <p className="text-slate-800 mt-1 font-medium">{contact.last_name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-slate-800 mt-1">{contact.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</p>
                <p className="text-slate-800 mt-1">{contact.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</p>
                <p className="text-slate-800 mt-1">{contact.role || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</p>
                <p className="text-slate-800 mt-1">{contact.company_name || '—'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactDetail;
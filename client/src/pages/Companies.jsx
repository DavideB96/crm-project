import { useState, useEffect } from 'react';
import Notification from '../components/Notifications';
import api from '../services/api';

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    email: '',
    phone: '',
    address: '',
  });

  // Load companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
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
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (editingCompany) {
        await api.put(`/companies/${editingCompany.id}`, formData);
        setNotification({ message: 'Company updated successfully!', type: 'success' });
      } else {
        await api.post('/companies', formData);
        setNotification({ message: 'Company created successfully!', type: 'success' });
      }
      setShowForm(false);
      setEditingCompany(null);
      setFormData({ name: '', industry: '', email: '', phone: '', address: '' });
      fetchCompanies();
    } catch {
      setNotification({ message: 'Error saving company', type: 'error' });
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await api.delete(`/companies/${id}`);
        setNotification({ message: 'Company deleted successfully!', type: 'success' });
        fetchCompanies();
      } catch {
        setNotification({ message: 'Error deleting company', type: 'error' });
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCompany(null);
    setFormData({ name: '', industry: '', email: '', phone: '', address: '' });
    setFormErrors({});
  };

  const filteredCompanies = companies.filter((company) => {
    const search = searchTerm.toLowerCase();
    return (
      company.name.toLowerCase().includes(search) ||
      (company.industry && company.industry.toLowerCase().includes(search)) ||
      (company.email && company.email.toLowerCase().includes(search))
    );
  });

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading...</div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Companies</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-36 sm:w-auto px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent bg-slate-50 text-sm"
          />
          <button
            onClick={() => setShowForm(true)}
            className="bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 px-3 py-2 sm:px-4"
          >
            <span className="text-lg leading-none">+</span>
            <span className="hidden sm:inline text-sm font-medium">New Company</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingCompany ? 'Edit Company' : 'New Company'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingCompany ? 'Save Changes' : 'Create Company'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredCompanies.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
          No companies found. Click "New Company" to add one!
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{company.name}</td>
                  <td className="px-6 py-4 text-gray-600">{company.industry}</td>
                  <td className="px-6 py-4 text-gray-600">{company.email}</td>
                  <td className="px-6 py-4 text-gray-600">{company.phone}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(company)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Companies;
import { useState, useEffect } from 'react';
import Notification from '../components/Notifications';
import api from '../services/api';

function Contacts() {
    const [contacts, setContacts] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [editingContact, setEditingContact] = useState(null);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: '',
        company_id: '',
    });

    useEffect(() => {
        fetchContacts();
        fetchCompanies();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await api.get('/contacts');
            setContacts(response.data);
        } catch (error) {
            console.error('Error loading contacts:', error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            const dataToSend = {
                ...formData,
                company_id: formData.company_id ? parseInt(formData.company_id) : null,
            };

            if (editingContact) {
                await api.put(`/contacts/${editingContact.id}`, dataToSend);
                setNotification({ message: 'Contact updated successfully!', type: 'success' });
            } else {
                await api.post('/contacts', dataToSend);
                setNotification({ message: 'Contact created successfully!', type: 'success' });
            }
            setShowForm(false);
            setEditingContact(null);
            setFormData({ first_name: '', last_name: '', email: '', phone: '', role: '', company_id: '' });
            fetchContacts();
        } catch {
            setNotification({ message: 'Error saving contact', type: 'error' });
        }
    };

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setFormData({
            first_name: contact.first_name,
            last_name: contact.last_name,
            email: contact.email || '',
            phone: contact.phone || '',
            role: contact.role || '',
            company_id: contact.company_id ? contact.company_id.toString() : '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            try {
                await api.delete(`/contacts/${id}`);
                setNotification({ message: 'Contact deleted successfully!', type: 'success' });
                fetchContacts();
            } catch {
                setNotification({ message: 'Error deleting contact', type: 'error' });
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingContact(null);
        setFormData({ first_name: '', last_name: '', email: '', phone: '', role: '', company_id: '' });
        setFormErrors({});
    };

    const filteredContacts = contacts.filter((contact) => {
        const search = searchTerm.toLowerCase();
        return (
            contact.first_name.toLowerCase().includes(search) ||
            contact.last_name.toLowerCase().includes(search) ||
            (contact.email && contact.email.toLowerCase().includes(search)) ||
            (contact.company_name && contact.company_name.toLowerCase().includes(search))
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
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Contacts</h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 px-3 py-2 sm:px-4"
                    >
                        <span className="text-lg leading-none">+</span>
                        <span className="hidden sm:inline text-sm font-medium">New Contact</span>
                    </button>
                </div>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent bg-slate-50 text-sm"
                />
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-bold mb-4">
                        {editingContact ? 'Edit Contact' : 'New Contact'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${formErrors.first_name ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                />
                                {formErrors.first_name && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${formErrors.last_name ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                />
                                {formErrors.last_name && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.last_name}</p>
                                )}
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
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${formErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
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
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${formErrors.phone ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                />
                                {formErrors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Role
                                </label>
                                <input
                                    type="text"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. Director, Manager..."
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Company
                                </label>
                                <select
                                    name="company_id"
                                    value={formData.company_id}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
                        <div className="flex gap-3 mt-4">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {editingContact ? 'Save Changes' : 'Create Contact'}
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

            {filteredContacts.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                    No contacts found. Click "New Contact" to add one!
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredContacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {contact.first_name} {contact.last_name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{contact.email}</td>
                                    <td className="px-6 py-4 text-gray-600">{contact.phone}</td>
                                    <td className="px-6 py-4 text-gray-600">{contact.role}</td>
                                    <td className="px-6 py-4 text-gray-600">{contact.company_name || '-'}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleEdit(contact)}
                                            className="text-blue-600 hover:text-blue-800 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(contact.id)}
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

export default Contacts;
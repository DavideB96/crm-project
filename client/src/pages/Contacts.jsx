import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: '',
        company_id: '',
    });

    const limit = 10;
    const navigate = useNavigate();

    const fetchContacts = useCallback(async (page, search, sort = sortBy, order = sortOrder) => {
        try {
            setLoading(true);
            const response = await api.get(`/contacts?page=${page}&limit=${limit}&search=${search}&sortBy=${sort}&sortOrder=${order}`);
            setContacts(response.data.data);
            setTotalPages(response.data.totalPages);
            setTotal(response.data.total);
            setCurrentPage(response.data.page);
        } catch (error) {
            console.error('Error loading contacts:', error);
        } finally {
            setLoading(false);
        }
    }, [sortBy, sortOrder]);

    const fetchCompanies = async () => {
        try {
            const response = await api.get('/companies/all');
            setCompanies(response.data);
        } catch (error) {
            console.error('Error loading companies:', error);
        }
    };

    // Caricamento iniziale
    useEffect(() => {
        fetchContacts(1, '');
        fetchCompanies();
    }, [fetchContacts]);

    // Debounce sulla ricerca: aspetta 300ms dopo l'ultima digitazione
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchValue]);

    // Quando cambia il termine di ricerca, torna a pagina 1
    useEffect(() => {
        setCurrentPage(1);
        fetchContacts(1, searchTerm);
    }, [searchTerm, fetchContacts]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchContacts(newPage, searchTerm);
        }
    };

    const handleSort = (column) => {
        const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newOrder);
        fetchContacts(1, searchTerm, column, newOrder);
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
            fetchContacts(currentPage, searchTerm);
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
                fetchContacts(currentPage, searchTerm);
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
                    <h1 className="text-3xl font-bold text-gray-800">
                        Contacts {total > 0 && <span className="text-lg font-normal text-gray-500">({total})</span>}
                    </h1>
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
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
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

            {loading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : contacts.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                    {searchTerm ? 'No contacts match your search.' : 'No contacts found. Click "New Contact" to add one!'}
                </div>
            ) : (
                <>
                    {/* Tabella desktop */}
                    <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[
                                        { key: 'first_name', label: 'Name' },
                                        { key: 'email', label: 'Email' },
                                        { key: 'phone', label: 'Phone' },
                                        { key: 'role', label: 'Role' },
                                        { key: 'company_name', label: 'Company' },
                                    ].map(({ key, label }) => (
                                        <th
                                            key={key}
                                            onClick={() => handleSort(key)}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700 hover:bg-gray-100 transition-colors select-none"
                                        >
                                            <span className="flex items-center gap-1">
                                                {label}
                                                {sortBy === key ? (
                                                    <span className="text-slate-800 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                                ) : (
                                                    <span className="text-gray-300">↕</span>
                                                )}
                                            </span>
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {contacts.map((contact) => (
                                    <tr
                                        key={contact.id}
                                        onClick={() => navigate(`/contacts/${contact.id}`)}
                                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            {contact.first_name} {contact.last_name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{contact.email}</td>
                                        <td className="px-6 py-4 text-gray-600">{contact.phone}</td>
                                        <td className="px-6 py-4 text-gray-600">{contact.role}</td>
                                        <td className="px-6 py-4 text-gray-600">{contact.company_name || '-'}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEdit(contact); }}
                                                className="text-blue-600 hover:text-blue-800 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(contact.id); }}
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

                    {/* Card view mobile */}
                    <div className="md:hidden space-y-3">
                        {contacts.map((contact) => (
                            <div
                                key={contact.id}
                                onClick={() => navigate(`/contacts/${contact.id}`)}
                                className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all active:bg-slate-50"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-slate-800">
                                            {contact.first_name} {contact.last_name}
                                        </p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {contact.role || 'No role'} {contact.company_name ? `· ${contact.company_name}` : ''}
                                        </p>
                                    </div>
                                    <span className="text-slate-400 text-lg">›</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Paginazione */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4 px-2">
                            <p className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages} — {total} contacts
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${currentPage === 1
                                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    ← Prev
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${currentPage === totalPages
                                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Contacts;